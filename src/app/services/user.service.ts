import { Inject, Injectable } from "@angular/core";
import { Http } from "@angular/http";
import * as _ from "lodash";
import { BehaviorSubject, Observable } from "rxjs";
import {userState, APP_CONFIG } from "../app.config";

@Injectable()
export class UserService {
  private stateSource = new BehaviorSubject<MITA.User.State>(_.cloneDeep(userState));
  state$ = this.stateSource.asObservable();
  getState() { return this.stateSource.value; }

  constructor(@Inject(APP_CONFIG) private config: MITA.config,
              private http: Http) { }


  get userAll(): Observable<MITA.User.APIDataAll[]> {
    const url = _.join([this.config.api.main, this.config.api.user.all], "/");
    return this.http.get(url)
      .map(data => data.json())
      .catch(err => Observable.throw(err));
  }

  get userAllGroupedByRole(): Observable<MITA.User.Data[][]> {
    return this.userAll
      .map((users): MITA.User.Data[][] => {
        return _.reduce(users, (acc, userData: MITA.User.APIDataAll) => {
          const userParsed: MITA.User.Data = {
            userId: userData.userId,
            roleId: userData.role.roleId,
            roleName: userData.role.name.toLowerCase() as MITA.RoleName,
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
            createdOn: new Date(userData.created_on),
            rating: userData.rating
          };
          const collIndex = userParsed.roleId - 1;
          if (collIndex < 0 || collIndex > 2) throw new Error("Invalid role id when trying to group users by role");
          const coll: MITA.User.Data[] = acc[collIndex];
          coll.splice(_.sortedIndexBy(coll, userParsed, "userId"), 0, userParsed);
          return acc;
        }, [[], [], []]);
      });
  }

  /**
   *
   * Get users by role
   * @param {MITA.RoleName} role
   * @returns {Observable<MITA.User.Data[]>}
   *
   * @memberOf UserService
   */
  userByRoleAll$(role: MITA.RoleName): Observable<MITA.User.Data[]> {
    if (role !== "collector" && role !== "reviewer") throw new Error("Invalid role for query");
    const users$ = this.state$.pluck(role) as Observable<MITA.User.Data[]>;
    if (!this.getState()[role].length) {
      return this.http.get(this.config.api.main + this.config.api.user[role])
        .map(data => data.json())
        .do(data => this.stateSource.next({
          ...this.getState(),
          [role]: data
        }))
        .switchMapTo(users$)
        .catch(err => Observable.throw(err));
    } else {
      return users$;
    }
  }

  /**
   *
   * Filter for this.userByRoleAll$ that returns users[]
   * in the format proper of a select element
   * @param {MITA.RoleName} role
   * @returns {Observable<MITA.User.Selectable[]>}
   *
   * @memberOf UserService
   */
  userByRoleAllSelectable$(role: MITA.RoleName): Observable<MITA.User.Selectable[]> {
    return this.userByRoleAll$(role)
      .map(users => _.map(users, user => {
          return {
            id: user.userId,
            text: user.name + " " + user.surname
          };
      }));
  }

  /**
   *
   * Get all current ongoing tasks for all users by role
   * @param {MITA.RoleName} role
   * @returns {Observable<MITA.User.CollectorCurrent[]>}
   *
   * @memberOf UserService
   */
  userCurrentAll$(role: MITA.RoleName): Observable<MITA.User.CollectorCurrent[]> {
    const url = this.config.api.main + "/" + role;

    return this.http.get(url)
      .map(data => data.json())
      .map(data => data.collectors || data.reviewers)
      .catch(err => Observable.throw(err));
  }

  userHistory$(role: MITA.RoleName, id: number): Observable<MITA.User.CollectorHistory[]> {
    const url = _.join([this.config.api.main, role, id], "/");
    return this.http.get(url)
      .map(data => data.json())
      .pluck("allTask")
      .catch(err => Observable.throw(err));
  }

  userByRoleRating$(role: MITA.RoleName): Observable<MITA.User.Rating[] | MITA.User.Selectable[]> {
    if (role !== "collector" ) return this.userByRoleAllSelectable$(role);
    const url = _.join([this.config.api.main, role, "user"], "/");

    return this.http.get(url)
      .map(data => data.json())
      .map((users: MITA.User.Rating[]) => {
        if (!users || users.length === 0) return users;
        return users.sort((a, b) => {
          if (b.rating === a.rating) return (a.name < b.name) ? 0 : 1;
          return b.rating - a.rating;
        });
      })
      .catch(err => Observable.throw(err));
  }

  userData(email: string): Observable<MITA.User.Data> {
    const url = _.join([this.config.api.main, this.config.api.user.byEmail, email], "/");
    return this.http.get(url)
      .map(data => data.json())
      .map((data: MITA.User.APIData): MITA.User.Data => {
        return {
          userId: data.user_id,
          roleId: data.role_id,
          roleName: data.role_name.toLowerCase() as MITA.RoleName,
          name: data.name,
          surname: data.surname,
          email: data.email,
          createdOn: new Date(data.created_on),
          rating: -1
        };
      })
      .catch(error => Observable.throw(error));
  }

  deactivateUser(userId: number): Observable<any> {
    const url = _.join([this.config.api.main, this.config.api.user.deactivate], "/");
    return this.http.post(url, {user_id: userId})
      .map(data => data.json())
      .catch(err => Observable.throw(err));
  }

  removeUser(userId: number): Observable<any> {
    const url = _.join([this.config.api.main, this.config.api.user.remove, userId], "/");
    return this.deactivateUser(userId)
      .flatMap(res => this.http.delete(url))
      .map(data => data.json())
      .catch(err => Observable.throw(err));
  }

}
