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
import { SummaryService } from "./summary.service";
import { config, APP_CONFIG } from "../../app.config";
const summaryFake = require("../../../test-helpers/test-data/summary.json");

describe("SummaryService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        SummaryService,
        { provide: APP_CONFIG, useValue: config },
        { provide: Http,
          useFactory:
            (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
            deps: [MockBackend, BaseRequestOptions] }
      ]
    });
  });

  it("should create service", inject([SummaryService], (service: SummaryService) => {
    expect(service).toBeTruthy();
  }));

  it("should throw Error if HTTP doesn't return ok",
    inject([SummaryService, MockBackend], (svc: SummaryService, backend): void => {
      backend.connections.subscribe(c => {
        c.mockRespond(new Error());
      });
      svc.progressInfo$.subscribe(data => data,
                                  error => expect(error).toEqual(jasmine.any(Error)));
    }));
});
