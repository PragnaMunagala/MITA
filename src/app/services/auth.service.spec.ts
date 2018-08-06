import { EventEmitter } from "@angular/core";
import { fakeAsync, async, tick, TestBed, inject } from "@angular/core/testing";
import { Router } from "@angular/router";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {
  Http,
  ConnectionBackend,
  BaseRequestOptions,
  Response,
  ResponseOptions
} from "@angular/http";
import {
  AuthService,
  UserService
} from "./index";
import { APP_CONFIG, config } from "../app.config";
import * as jwt from "angular2-jwt";
import { RouterStub } from "../../test-helpers/router-stubs.spec";
import {
  UserServiceStub
 } from "../../test-helpers/services-stubs.spec";
import Auth0Lock from "auth0-lock";
import {environment} from "../../environments/environment";
import {Observable, Subscription} from "rxjs";
const fakeUser = require('../../test-helpers/test-data/user.json');

const configStub = {
  api: {
    main: "",
    user: {
      create: ""
    }
  },
  auth: {
    clientID: "TEST",
    domain: "advinow.test",
    apiToken: {
      url: "",
      payload: "",
    }
  }
};

class JwtHelperStub {
  expired = false;

  decodeToken(t) { return t; }
  isTokenExpired(t) { return this.expired; }
}

describe("AuthService", () => {
  let svc: AuthService;
  let mockBackend: MockBackend;
  let jwtHelper: JwtHelperStub;
  let lock: Auth0LockStatic;
  let http: Http;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
          AuthService,
          BaseRequestOptions,
          MockBackend,
          { provide: jwt.JwtHelper, useClass: JwtHelperStub },
          { provide: Router, useClass: RouterStub},
          { provide: APP_CONFIG, useValue: config},
          { provide: UserService, useClass: UserServiceStub},
          { provide: Http, useFactory:
            (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
            deps: [MockBackend, BaseRequestOptions] }
        ]
    });

    svc = TestBed.get(AuthService);
    mockBackend = TestBed.get(MockBackend);
    jwtHelper = TestBed.get(jwt.JwtHelper);
    http = TestBed.get(Http);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function apiTokenFake() {
    mockBackend.connections.subscribe(c => {
      let response = new ResponseOptions({body: {access_token: ""}});
      c.mockRespond(new Response(response));
    });
  }

  function createUserFake() {
    mockBackend.connections.subscribe(c => {
      let response = new ResponseOptions({body: {
          email: "",
          app_metadata: {
            name: "",
            surname: "",
            role: ""
          }
        }
      });
      c.mockRespond(new Response(response));
    });
  }

  function mockError(backend: MockBackend, error?: any): Subscription {
    return backend.connections.subscribe(c => {
      if (error === "TimeoutError") {
        c.mockError({name: error});
        return;
      }
      let response = new ResponseOptions({body: error || {}, status: error && error.status || 400}, );
      c.mockError(new Response(response));
    });
  }

  interface ErrorParams {
    urlPart: string;
    method: number;
    error?: any;
  }

  function mockSuccess(backend: MockBackend, errorParams?: ErrorParams) {
    backend.connections.subscribe(c => {
      const req = c.request;
      const defaultError = {status: 404};
      let response: ResponseOptions;

      console.log(req.url);

      if (errorParams && errorParams.method === req.method && ~req.url.indexOf(errorParams.urlPart)) {
        response = new ResponseOptions({body: errorParams.error ? errorParams.error : defaultError});
        c.mockError(new Response(response));
      } else {
        response = new ResponseOptions(success(c));
        c.mockRespond(new Response(response));
      }
    });

    const success = (c) => {
      if (~c.request.url.indexOf('q=email%3D') && c.request.method === 0) return {body: [fakeUser.email]};
      if (c.request.url.endsWith(config.api.user.create) || (c.request.url.endsWith('/api/v2/users') && c.request.method === 1)) {
        return {body: {
          email: "",
          app_metadata: {
            name: "",
            surname: "",
            role: ""
          }
        }
        };
      }
      return {body: {success: true}}
    };

  }

  function failOnData() {
    return fail("Data should not have been returned");
  }

  it("should create", inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it("should store JWT in local storage on Lock's authenticate event", () => {
    const spy = spyOn(localStorage, "setItem");
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    expect(spy).toHaveBeenCalled();
    expect(svc["subs"].length).toEqual(1);
  });

  it("should expose an Observable which emits null if user is not logged in", () => {
    svc.auth0State.subscribe(value => {
      expect(value).toBeNull();
    });
  });

  it("should expose an Observable which emits user data if user is logged in", () => {
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    svc.auth0State.subscribe(user => {
      expect(user.name).toBe("Juan");
      expect(user.roleId).toEqual(1);
    });
  });

  it("should detect if user is logged in synchronously", () => {
    expect(svc.isAuthenticated).toBeFalsy();
  });

  it("should detect if user is not logged in synchronously", () => {
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    expect(svc.isAuthenticated).toBeTruthy();
  });

  it("should detect if user is logged in asynchronously", () => {
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    jwtHelper.expired = false;
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    svc.isAuthenticated$.subscribe(result => expect(result).toBeTruthy());
  });

  it("should detect if user's token has expired asynchronously", () => {
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    jwtHelper.expired = true;
    spyOn(jwt, "tokenNotExpired").and.returnValue(false);
    svc.isAuthenticated$.subscribe(result => {
      expect(result).toBeFalsy();
    });
  });

  it("should show Lock's widget when requested to do so", () => {
    const spy = spyOn(svc["lock"], "show");
    svc.showWidget();
    expect(spy).toHaveBeenCalled();
  });

  it("should remove JWT from local storage when user logs out", () => {
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    expect(localStorage.getItem("id_token.MITA")).not.toBeNull();
    svc.logout();
    expect(localStorage.getItem("id_token.MITA")).toBeNull();
  });

  it("should emit to all subscribers a null value when user logs out", () => {
    let result;
    svc.auth0State.subscribe(user => {
      result = user;
    });
    expect(result).toBeNull();
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    expect(result).not.toBeNull();
    svc.logout();
    expect(result).toBeNull();
  });

  it("user$ should safeguard subscribers against null user values", () => {
    svc.user$.subscribe(user => {
      fail("Subscription should not receive values");
    });
    expect(true);
  });


  it("user$ should emit user data if there is any and keep it", () => {
    let result;
    svc.user$.subscribe(user => {
      result = user;
    });
    expect(result).toBeUndefined();
    svc["lock"]["_events"]["authenticated"]({idToken: ""});
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    expect(result).not.toBeNull();
    svc.logout();
    expect(result).not.toBeNull();
  });

  it("should get auth0's token to user api when not stored locally", () => {
    apiTokenFake();
    svc.apiToken.subscribe((token: any) => {
      expect(token).toEqual({access_token: ""});
    });
  });

  it("should return stored auth0's api token if stored locally", fakeAsync(() => {
    localStorage.setItem("id_token.MITA", JSON.stringify({access_token: "cached"}));
    localStorage.setItem("api_token.MITA", JSON.stringify({access_token: "cached"}));
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    jwtHelper.expired = false;
    svc.apiToken.subscribe((token: any) => {
      expect(token).toEqual({access_token: "cached"});
    });
  }));

  it("should create user in both auth0 and postgresql data", () => {
    localStorage.setItem("api_token.MITA", JSON.stringify({access_token: "cached"}));
    mockSuccess(mockBackend);
    svc.createUser(null).subscribe((result: any) => {
      console.log(result);
      expect(result.email).toEqual("");
    });
  });

  it("should create user in both auth0 and postgresql data", () => {
    const errorParams: ErrorParams = {urlPart: 'v2/users', method: 1};
    const removeUser = spyOn(svc, 'removeUser').and.returnValue(Observable.of(true));
    localStorage.setItem("api_token.MITA", JSON.stringify({access_token: "cached"}));
    mockSuccess(mockBackend, errorParams);

    svc.createUser(null).subscribe(failOnData, err => expect(err).toBeTruthy()).unsubscribe();

    errorParams.error = {
      errorCode: 'auth0_idp_error',
      message: 'The user already exists.'
    };
    svc.createUser(null).subscribe(res => {
      expect(res.email).toEqual('');
    }).unsubscribe();

    // errorParams.urlPart = config.api.user.create;
    // errorParams.method = 2;
    // svc.createUser(null).subscribe(failOnData, err => {
    //   console.log(err);
    //   expect(err).toEqual(errorParams.error)
    // }).unsubscribe();
  });

  it("should throw error when user already exists", () => {
    localStorage.setItem("api_token.MITA", JSON.stringify({access_token: "cached"}));
    mockError(mockBackend);
    svc.createUser(null)
      .subscribe(failOnData,
        error => expect(error).toBeTruthy());
  });

  it("should throw error when unable to create user", () => {
    const removeUserSpy = spyOn(svc, "removeUser").and.returnValue(Observable.of(true));
    const user: MITA.Auth0.NewUser = {
      connection: "Username-Password-Authentication",
      email: "user@email.com",
      password: "password",
      app_metadata: {
        name: "user",
        surname: "user",
        role: 1
      }
    };

    let backendSub = mockError(mockBackend, {statusCode: 500});
    let error;
    let result;

    spyOnProperty(svc, "apiToken", "get").and.returnValue(Observable.of(JSON.stringify({access_token: "cached"})));

    svc.createUser(user).subscribe(failOnData, err => error = err);
    expect(error).toBeTruthy();
    backendSub.unsubscribe();

    backendSub = mockError(mockBackend, {statusCode: 409, message: "The user already exists."});
    const resp = new Response(new ResponseOptions({status: 200, body: user}));
    spyOn(http, "post").and.returnValue(Observable.of(resp));
    svc.createUser(user).subscribe(res => result = res);
    expect(result.email).toEqual(user.email);
    backendSub.unsubscribe();
  });

  it("should remove user from auth0", () => {
    localStorage.setItem("api_token.MITA", JSON.stringify({access_token: "cached"}));
    mockSuccess(mockBackend);
    svc.removeUser(null)
      .subscribe((result: any) => {
        expect(result.json().success).toBeTruthy();
      });
  });

  it("should throw an error when unable to remove user from auth0", () => {
    localStorage.setItem("api_token.MITA", JSON.stringify({access_token: "cached"}));
    mockError(mockBackend, {status: 500});
    svc.removeUser(null)
      .subscribe(failOnData, error => {
        console.log(error);
        expect(error.status).toEqual(500)
      });
  });

  it("should not throw an error when status is 404", () => {
    localStorage.setItem("api_token.MITA", JSON.stringify({access_token: "cached"}));
    mockError(mockBackend, {status: 404});
    svc.removeUser(null)
      .subscribe(failOnData, failOnData);
  });
});


describe("AuthService with Valid Cached Data and Production", () => {
  let svc: AuthService;
  let mockBackend: MockBackend;
  let jwtHelper: JwtHelperStub;
  let lock: Auth0LockStatic;

  beforeEach(() => {
    localStorage.setItem("id_token.MITA", JSON.stringify({access_token: "cached"}));
    spyOn(environment, "production").and.returnValue(true);
    spyOn(jwt, "tokenNotExpired").and.returnValue(true);
    TestBed.configureTestingModule({
      providers: [
          AuthService,
          BaseRequestOptions,
          MockBackend,
          { provide: jwt.JwtHelper, useClass: JwtHelperStub },
          { provide: Router, useClass: RouterStub},
          { provide: APP_CONFIG, useValue: config},
          { provide: UserService, useClass: UserServiceStub},
          { provide: Http, useFactory:
            (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
            deps: [MockBackend, BaseRequestOptions] }
        ]
    });

    svc = TestBed.get(AuthService);
    mockBackend = TestBed.get(MockBackend);
    jwtHelper = TestBed.get(jwt.JwtHelper);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should create with cached data", () => {
    expect(svc).toBeTruthy();
  });

  it("should detect that login's widget icon is in production folder", () => {
    expect(svc["widgetOptions"]["theme"]["logo"]).toMatch("/MITA/assets/body-icon.png");
  });
});

