/**
 * Created by sergeyyudintsev on 20.07.17.
 */
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
import { TaskService } from "./task.service";
const fakeTasks = require("../../test-helpers/test-data/tasks.json");

describe("TaskService", () => {
  let backend: MockBackend;
  let svc: TaskService;

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

  function mockTaskList(backend: MockBackend) {
    backend.connections.subscribe(c => {
      let response = new ResponseOptions({body: fakeTasks.taskList["1"]});
      c.mockRespond(new Response(response));
    });
  }

  function mockSuccess(backend: MockBackend) {
    backend.connections.subscribe(c => {
      let response = new ResponseOptions({body: {success: true}});
      c.mockRespond(new Response(response));
    });
  }

  function failOnData(err) {
    console.error("err: ", err);
    return fail("Data should not have been returned");
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        TaskService,
        { provide: APP_CONFIG, useValue: config },
        { provide: Http,
          useFactory:
            (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions] }
      ]
    });
    backend = TestBed.get(MockBackend);
    svc = TestBed.get(TaskService);
  });

  it("should create", inject([TaskService], (service: TaskService) => {
    expect(service).toBeTruthy();
  }));

  it('should reset task', () => {
    mockSuccess(backend);
    svc.resetTask(null).subscribe((res: any) => {
      expect(res.success).toBe(true)
    });
  });

  it("should throw an error when unable to reset task", () => {
    mockError(backend);
    svc.resetTask(null).subscribe(failOnData, err => {
      expect(err.statusCode).toEqual(500)
    })
  });

  it("should get task list", () => {
    mockTaskList(backend);
    svc.getTasks(1, 10, "collector").subscribe((res: any) => {
      expect(res.taskList[0].id_task).isPrototypeOf(Number)
    })
  });

  it("should throw when unable to get tasks", fakeAsync(() => {
    mockError(backend);
    svc.getTasks(1, 10, "collector").subscribe(failOnData, err => {
      expect(err.statusCode).toEqual(500)
    });
  }));

  it("should return merged observable", fakeAsync(() => {
    let counter = 0;
    _.forEach(fakeTasks.taskList["1"].taskList, (task: MITA.Task.FullData, idx: number) => {
      const newTask: MITA.Task.FullData = Object.assign({}, task);
      newTask.idTask += 1;
      svc["cachedData"].collector.taskList[idx + 1] = newTask;
    });
    svc["cachedData"].collector.totalElements = fakeTasks.taskList["1"].totalElements;
    mockTaskList(backend);
    svc.getTasks(1, 10, "collector").subscribe(data => {
      counter++;
      expect(data.taskList[0]).toBeTruthy();
    }, failOnData);
    expect(counter).toEqual(2);
  }));

  it("should throw an error when unable to reset task", () => {
    mockError(backend);
    svc.resetTask(null).subscribe(failOnData, err => {
      expect(err.statusCode).toEqual(500)
    })
  });

  it("should return null when page doesn't exist", () => {
    mockPageNumberError(backend);
    svc.getTasks(1, 10, "collector").subscribe(failOnData, err => {
      expect(err.statusCode).toEqual(400)
    });
  });

  it("should not to return data if it wasn't be changed", () => {
    mockTaskList(backend);
    svc.getTasks(1, 10, "collector");
    svc.getTasks(1, 10, "collector").subscribe(data => expect(data.taskList[0]).toBeTruthy(), failOnData)
  });

  it("should search users by email", () => {
    mockTaskList(backend);
    svc.getTasks(1, 10, "", "jim").subscribe(data => expect(data.taskList[0]).toBeTruthy(), failOnData)
  });

  it("should send request with correct filters", () => {
    const role: MITA.RoleName = "collector";
    const user = "some@email.com";
    const page = 1;
    const pageSize = 10;
    const filterByRole = `filterByRole=${role}`;
    const filterByUser = `&filterByUser=${user}`;
    const httpGet = spyOn(svc["http"], "get").and.callThrough();
    let url = _.join([config.api.main, config.api.task.list, `?${filterByRole}&page=${page}&page_size=${pageSize}`], "/");
    svc.getTasks(page, pageSize, role);
    expect(httpGet).toHaveBeenCalledWith(url);
    url = _.join([config.api.main, config.api.task.list, `?${filterByUser}&page=${page}&page_size=${pageSize}`], "/");
    svc.getTasks(page, pageSize, "", user);
    expect(httpGet).toHaveBeenCalledWith(url);
  });
});
