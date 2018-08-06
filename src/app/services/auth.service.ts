import { Inject, Injectable }      from "@angular/core";
import { Http, RequestOptions, Headers, Response } from "@angular/http";
import { Router } from "@angular/router";
import { tokenNotExpired, JwtHelper } from "angular2-jwt";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import * as _ from "lodash";
import { APP_CONFIG } from "../app.config";
import { UserService } from "./user.service";
import Auth0Lock from "auth0-lock";
import { environment } from "../../environments/environment";
import {withIdentifier} from "codelyzer/util/astQuery";

@Injectable()
export class AuthService {
  // Configure Auth0
  private widgetOptions: Auth0LockConstructorOptions = {
    auth: {
      redirect: false,
      params: {
        scope: "openid email"
      },
      sso: false
    },
    autoclose: true,
    languageDictionary: {
      title: `MITA-${environment.production ? "PROD" : "DEV"}`,
      error: {
        login: {
          "lock.invalid_email_password": "Not Authorized for Access"
        }
      }
    },
    theme: {
      logo: `${environment.production ? "/MITA" : ""}/assets/body-icon.png`,
      primaryColor: "#0275d8"
    },
    rememberLastLogin: false
  };
  auth0State: BehaviorSubject<MITA.User.Data | null> = new BehaviorSubject(null);
  private lock = new Auth0Lock(this.config.auth.clientID, this.config.auth.domain, this.widgetOptions);
  private subs: Subscription[] = [];

  constructor(@Inject(APP_CONFIG) private config: MITA.config,
              private userSvc: UserService,
              private jwtHelper: JwtHelper,
              private http: Http,
              private router: Router) {
    if (this.isAuthenticated) this.subs.push(this.userDataSub);
    this.lock.on("authenticated", (authResult: any) => {
      localStorage.setItem("id_token.MITA", authResult.idToken);
      this.subs.push(this.userDataSub);
    });
  }

  get isAuthenticated(): boolean { return tokenNotExpired("id_token.MITA"); }
  get isAuthenticated$(): Observable<boolean> {
      return this.auth0State
      .filter(u => !!u)
      .map(u => {
      if (!this.isAuthenticated) return false;
      return u && !!u.roleName;
    });
  }
  get user$() { return this.auth0State.filter(user => !!user); }
  private get userDataSub(): Subscription {
    return this.userSvc.userData(this.email)
          .subscribe(u => this.auth0State.next(u), this.auth0State.error);
  }
  private get token() {return localStorage.getItem("id_token.MITA"); }
  private get email(): string { return this.token ? this.jwtHelper.decodeToken(this.token)["email"] : ""; }

  showWidget() {
    this.lock.show();
  }

  logout() {
    localStorage.removeItem("id_token.MITA");
    localStorage.removeItem("api_token.MITA");
    _.each(this.subs, s => s.unsubscribe);
    this.subs = [];
    this.auth0State.next(null);
  }

  get apiToken(): Observable<MITA.Auth0.APIAccessToken> {
    const storedToken = localStorage.getItem("api_token.MITA");
    if (!this.token) {
      this.logout();
      this.router.navigate(["logout"]);
    } else if (storedToken && tokenNotExpired("api_token.MITA")) {
      return Observable.of(JSON.parse(storedToken));
    }
    const api = this.config.auth.apiToken;
    const headers = new Headers({
      "Content-Type": "application/json"
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.post(api.url, api.payload, options)
      .map(res => res.json())
      .do(token => {
        localStorage.setItem("api_token.MITA", JSON.stringify(token));
      });
  }

  createUser(user: MITA.Auth0.NewUser): Observable<MITA.Auth0.NewUserResponse> {
    const url = `https://${this.config.auth.domain}/api/v2/users`;
    const createMitaUser = (newUser: MITA.Auth0.NewUserResponse | MITA.Auth0.NewUser): Observable<any> => {
      const mitaUrl = this.config.api.main + "/" + this.config.api.user.create;
      const headers = new Headers({
        "Content-Type": "application/json",
      });
      const options = new RequestOptions({
        headers: headers
      });
      const payload: MITA.Payload.NewUser = {
        name: newUser && newUser.app_metadata.name,
        surname: newUser && newUser.app_metadata.surname,
        email: newUser && newUser.email,
        role: newUser && String(newUser.app_metadata.role)
      };
      return this.http.put(mitaUrl, payload, options)
        .catch(err => {
          const error = err.json();
          if (error.statusCode === 409 && error.message === "The user already exists.") return Observable.of(false);
          console.log('we\'re here');
          return this.removeUser(user.email)
            .flatMap(res => {
              console.log('flatMap');
              return Observable.throw(err)
            })
            .catch(deleteErr => {
              console.log('removeUser catch');
              return Observable.throw(err)
            });
        });
    };

    return this.apiToken.switchMap(token => {
      const headers = new Headers({
        "Content-Type": "application/json",
        authorization: token.token_type + " " + token.access_token,
      });
      const options = new RequestOptions({
        headers: headers
      });

      return createMitaUser(user)
        .flatMap(newMitaUser => {
          console.log('it\'s here');
          return this.http.post(url, user, options)
            .catch(err => {
              const error = err.json();
              if (error.errorCode === "auth0_idp_error" && error.message === "The user already exists." && newMitaUser) return Observable.of(newMitaUser);
              return Observable.throw(err);
            });
        })
        .switchMap(newUser => Observable.of(newUser.json()))
        .catch(err => {
          console.log('global catch', err);
          return Observable.throw(err.json())
        });
    });
  }

  removeUser(email: string): Observable<any> {
    let token: MITA.Auth0.APIAccessToken;
    return this.apiToken
      .switchMap(res => {
        token = res;
        const url = `https://${this.config.auth.domain}/api/v2/users?q=email%3D${email}`;
        const headers = new Headers({
          "Content-Type": "application/json",
          authorization: token.token_type + " " + token.access_token,
        });
        const options = new RequestOptions({
          headers: headers
        });
        return this.http.get(url, options);
      })
      .map(res => {
        return res.json()
      })
      .map(users => users[0])
      .map(user => user && user.user_id)
      .filter(userId => !!userId)
      .flatMap(userId => {
        const headers = new Headers({
          "Content-Type": "application/json",
          authorization: token.token_type + " " + token.access_token,
        });
        const options = new RequestOptions({
          headers: headers
        });
        const url = `https://${_.join([this.config.auth.domain, "api/v2", this.config.auth.user.root, userId], "/")}`;
        return this.http.delete(url, options);
      })
      .catch(err => {
        if (err.status === 404) {
          return Observable.empty();
        } else {
          return Observable.throw(err);
        }
      });
  }
}
