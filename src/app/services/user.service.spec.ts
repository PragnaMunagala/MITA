/* tslint:disable:no-unused-variable */

import {
  inject,
  fakeAsync,
  tick,
  TestBed
} from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import {
  Http,
  ConnectionBackend,
  BaseRequestOptions,
  Response,
  ResponseOptions
} from "@angular/http";
import * as _ from "lodash";
import { config, APP_CONFIG } from "../app.config";
import { UserService } from "./user.service";
const userDataFake = require("../../test-helpers/test-data/user.json");
const tasksFake = require("../../test-helpers/test-data/tasks.json");

describe("UserService", () => {
  let backend: MockBackend;
  let svc: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        UserService,
        { provide: APP_CONFIG, useValue: config },
        { provide: Http,
          useFactory:
            (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
            deps: [MockBackend, BaseRequestOptions] }
        ]
    });
    backend = TestBed.get(MockBackend);
    svc = TestBed.get(UserService);
  });

  function usersFake(backend: MockBackend, role: MITA.RoleName | "all") {
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: userDataFake[role]});
      c.mockRespond(new Response(response));
    });
  }

  function userFake(backend: MockBackend) {
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: userDataFake["email"]});
      c.mockRespond(new Response(response));
    });
  }

  function mockError(backend: MockBackend) {
    backend.connections.subscribe(c => {
      c.mockRespond(new Error());
    });
  }

  function mockSuccess(backend: MockBackend) {
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: {success: true}});
      c.mockRespond(new Response(response));
    });
  }

  function failOnData() {
    return fail("Data should not have been returned");
  }

  it("should get all data collectors", () => {
    let collectors: MITA.User.Data[] = [];
    usersFake(backend, "collector");
    svc.userByRoleAll$("collector").subscribe(data => collectors = data);
    expect(userDataFake["collector"]).toEqual(collectors);
  });

  it("should get all reviewers", () => {
    let reviewers: MITA.User.Data[] = [];
    usersFake(backend, "reviewer");
    svc.userByRoleAll$("reviewer").subscribe(data => reviewers = data);
    expect(userDataFake["reviewer"]).toEqual(reviewers);
  });

  it("should get users from current state", () => {
    let role: MITA.RoleName = "reviewer";
    let users: MITA.User.Data[] = userDataFake[role];
    let result: MITA.User.Data[] = [];
    svc["stateSource"].next({
      ...svc.getState(),
      [role]: users
    });
    svc.userByRoleAll$(role).subscribe(data => result = data);
    expect(users).toEqual(result);
  });

  it("should throw if users are requested by invalid role name", () => {
    const userRequest = () => svc.userByRoleAll$(<any>"noexists");
    expect(userRequest).toThrow(Error("Invalid role for query"));
  });

  it("should throw Error if getting users by role returns error", () => {
    mockError(backend);
    svc.userByRoleAll$("collector")
      .subscribe(failOnData,
                 error => expect(error).toEqual(jasmine.any(Error)));
  });

  it("should get all users and group them by role", () => {
    usersFake(backend, "all");
    svc.userAllGroupedByRole.subscribe(users => {
      expect(users.length).toEqual(3);
      expect(users[0][0].roleId).toEqual(1);
      expect(users[1][0].roleId).toEqual(2);
      expect(users[2][0].roleId).toEqual(3);
    });
  });

  it("should throw Error if getting users grouped by role returns error", () => {
    mockError(backend);
    svc.userAllGroupedByRole
      .subscribe(failOnData,
                 error => expect(error).toEqual(jasmine.any(Error)));
  });

  it("should get user data by Email", () => {
    userFake(backend);
    svc.userData("test@test.com")
      .subscribe(user => {
        const fakeUser: MITA.User.APIData = userDataFake["email"];
        expect(user.roleId).toEqual(fakeUser.role_id);
        expect(user.name).toEqual(fakeUser.name);
      });
  });

  it("should throw error when unable to get user data by Email", () => {
    mockError(backend);
    svc.userData("test@test.com")
      .subscribe(failOnData,
                 error => expect(error).toEqual(jasmine.any(Error)));
  });

  it("should throw Error if user data includes invalid roleID", () => {
    const corruptedUsers = userDataFake["all"];
    corruptedUsers[0].role.roleId = 10;
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: corruptedUsers});
      c.mockRespond(new Response(response));
    });
    svc.userAllGroupedByRole
      .subscribe(failOnData,
                 error => expect(error).toEqual(new Error("Invalid role id when trying to group users by role")));
  });

  it("should get all reviewers for a <select> element", () => {
    let reviewers: MITA.User.Selectable[] = [];
    usersFake(backend, "reviewer");
    svc.userByRoleAllSelectable$("reviewer").subscribe(data => reviewers = data);
    _.each(reviewers, reviewer => {
      expect(_.has(reviewer, "text"));
      expect(_.has(reviewer, "id"));
      expect(_.keys(reviewer).length === 2);
    });
  });

  it("should get all current tasks assigned to collectors", () => {
    let tasks: MITA.User.CollectorCurrent[] = [];
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: tasksFake.current});
      c.mockRespond(new Response(response));
    });
    svc.userCurrentAll$("collector").subscribe(data => tasks = data);
    expect(tasksFake.current["collectors"]).toEqual(tasks);
  });

  it("should get all current tasks assigned to reviewers", () => {
    let tasks: MITA.User.CollectorCurrent[] = [];
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: tasksFake["current-reviewer"]});
      c.mockRespond(new Response(response));
    });
    svc.userCurrentAll$("reviewer").subscribe(data => tasks = data);
    expect(tasksFake["current-reviewer"]["reviewers"]).toEqual(tasks);
  });

  it("should throw Error if trying to get current tasks returns error", () => {
    mockError(backend);
    svc.userCurrentAll$("collector")
      .subscribe(failOnData,
                 error => expect(error).toEqual(jasmine.any(Error)));
  });

  it("should get all history tasks assigned to a reviewer", () => {
      let tasks: MITA.User.ReviewerHistory[] = [];
      backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: tasksFake.history});
        c.mockRespond(new Response(response));
      });
      svc.userHistory$("reviewer", 5).subscribe(data => tasks = data);
      expect(tasksFake.history["allTask"]).toEqual(tasks);
  });

  it("should throw Error if trying to get history items returns error", () => {
    mockError(backend);
    svc.userHistory$("reviewer", 5)
      .subscribe(failOnData,
                 error => expect(error).toEqual(jasmine.any(Error)));
  });

  it("should get all collectors with their rating ordered by rating and name", () => {
    let ratings: MITA.User.Rating[] = [];
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: userDataFake.rating});
      c.mockRespond(new Response(response));
    });
    svc.userByRoleRating$("collector").subscribe((data: MITA.User.Rating[]) => ratings = data);
    expect(userDataFake.rating).toEqual(ratings);
  });

  it("should get all collectors with their rating and don't sort if there are no collectors", () => {
    let ratings: MITA.User.Rating[] = [];
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: []});
      c.mockRespond(new Response(response));
    });
    svc.userByRoleRating$("collector").subscribe((data: MITA.User.Rating[]) => ratings = data);
    expect([]).toEqual(ratings);
  });

  it("should throw Error if trying to get users with ratings returns error", () => {
    mockError(backend);
    svc.userByRoleRating$("collector").subscribe(data => data,
                                                  error => expect(error).toEqual(jasmine.any(Error)));
  });

  it("should get users in selectable format without rating when role (i.e.: reviewers) doesn't have one", () => {
    let users: MITA.User.Selectable[] = [];
    usersFake(backend, "reviewer");
    svc.userByRoleRating$("reviewer").subscribe((data: MITA.User.Selectable[]) => users = data);
    _.each(users, reviewer => {
      expect(_.has(reviewer, "text"));
      expect(_.has(reviewer, "id"));
      expect(_.keys(reviewer).length === 2);
    });
  });

  it("should remove user from postgresql", () => {
    mockSuccess(backend);
    svc.removeUser(null).subscribe((res: any) => {
      expect(res.success).toBe(true);
    });
  });

  it("should throw an error when unable to remove user from postgresql", () => {
    mockError(backend);
    svc.removeUser(null)
      .subscribe(failOnData,
                  error => expect(error).toEqual(jasmine.any(Error)));
  });

});
