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
import { IllnessService } from "./illness.service";
const illnessDataFake = require("../../test-helpers/test-data/illness.json");
const progressDataFake = require("../../test-helpers/test-data/progress.json");

describe("IllnessService", () => {
  let backend: MockBackend;
  let svc: IllnessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        IllnessService,
        { provide: APP_CONFIG, useValue: config },
        { provide: Http,
          useFactory:
            (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
            deps: [MockBackend, BaseRequestOptions] }
        ]
    });
    backend = TestBed.get(MockBackend);
    svc = TestBed.get(IllnessService);
  });

  function illnessFake(backend: MockBackend, page) {
    backend.connections.subscribe(c => {
      let response = new ResponseOptions({body: illnessDataFake[page]});
      c.mockRespond(new Response(response));
    });
  }

  function mockError(backend: MockBackend) {
    backend.connections.subscribe(c => {
      let response = new ResponseOptions({
        body: {
          message: 'Some error',
          statusCode: 500
        },
        status: 500
      });
      c.mockError(new Response(response));
    });
  }

  function mockPageNumberError(backend: MockBackend) {
    backend.connections.subscribe(c => {
      let response = new ResponseOptions({
        body: {
          message: 'This page doesn\'t exist',
          statusCode: 400
        },
        status: 400
      });
      c.mockError(new Response(response));
    });
  }

  function mockProgress(backend: MockBackend) {
    backend.connections.subscribe(c => {
      let response = new ResponseOptions({body: progressDataFake});
      c.mockRespond(new Response(response));
    });
  }

  function mockInfo(backend: MockBackend) {
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: [{
        userID: 4,
          illnesses: [
            {
              icd10Code: "A00.0",
              name: "Cholera due to Vibrio cholerae 01, biovar cholerae",
              prior: 0,
              source: "MICA",
              state: "COMPLETE",
              updatedDate: 1510088752251,
              version: 1
            }
          ]
      }]});
      c.mockRespond(new Response(response));
    });
  }

  function mockEmptyProgress(backend: MockBackend) {
    backend.connections.subscribe(c => {
      const emptyProgressData: MITA.Illness.ProgressResponse = Object.assign({}, progressDataFake);
      emptyProgressData.progressVOList = [];
      let response = new ResponseOptions({body: emptyProgressData});
      c.mockRespond(new Response(response));
    });
  }

  function mockSuccess(backend: MockBackend) {
    backend.connections.subscribe(c => {
      let response = new ResponseOptions({body: {success: true}});
      c.mockRespond(new Response(response));
    });
  }

  function failOnData() {
    return fail("Data should not have been returned");
  }

  it("should get list of tracking illnesses", () => {
    illnessFake(backend, 1);
    svc.getTracking('A', 1, 10).subscribe(data => expect(data.trackingVOList && data.trackingVOList[0]).toBeTruthy());
  });

  it("should handle page existence error", () => {
    mockPageNumberError(backend);
    svc.getTracking('A', null, 10).subscribe(data => expect(data).toEqual(null), err => failOnData);
  });

  it("should throw an error when unable to get list of tracking illnesses", () => {
    mockError(backend);
    svc.getTracking('A', 1, 10).subscribe(failOnData, err => {
      expect(err.statusCode).toEqual(500);
    });
  });

  it("should get illness progress info", () => {
    mockProgress(backend);
    svc.getProgress('A').subscribe(data => expect(data.id_icd10_code).toBeTruthy(), failOnData);
  });

  it("should return null if no progress info comes from backend", () => {
    mockEmptyProgress(backend);
    svc.getProgress('A').subscribe(data => expect(data).toEqual(null), failOnData);
  });

  it("should return an error if backend request failed", () => {
    mockError(backend);
    svc.getProgress('A').subscribe(failOnData, err => {
      expect(err.statusCode).toEqual(500);
    });
  });

  it("should fetch illnesses info", () => {
    mockInfo(backend);
    const result = {
      "A00.0v1": {
        icd10Code: "A00.0",
        name: "Cholera due to Vibrio cholerae 01, biovar cholerae",
        prior: 0,
        source: "MICA",
        state: "COMPLETE",
        updatedDate: 1510088752251,
        version: 1
      }
    };
    svc.getInfo().subscribe(data => expect(data).toEqual(result as any));
  });

});
