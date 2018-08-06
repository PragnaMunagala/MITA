import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {TaskComponent} from "./task.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {TaskTableComponent} from "./task-table/task-table.component";
import {TaskService} from "../../services/task.service";
import {IllnessServiceStub, TaskServiceStub, UserServiceStub} from "../../../test-helpers/services-stubs.spec";
import {FormsModule} from "@angular/forms";
import {TitleCasePipe} from "../../pipes/title-case.pipe";
import {UserService} from "../../services/user.service";
import {Token} from "@angular/compiler";
import {APP_CONFIG, config} from "../../app.config";
import {OpaqueToken} from "@angular/core";
import {BaseRequestOptions, ConnectionBackend, Http} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {IllnessService} from "../../services";
import {TaskIllnessTableComponent} from "./task-illness-table/task-illness-table.component";

describe("TaskComponent", () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let rendered: Element;
  let taskService: TaskServiceStub;
  let illnessService: IllnessServiceStub;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TaskComponent,
        TaskTableComponent,
        TitleCasePipe,
        TaskIllnessTableComponent
      ],
      imports: [
        NgbModule.forRoot(),
        FormsModule
      ],
      providers: [
        {provide: TaskService, useClass: TaskServiceStub},
        {provide: IllnessService, useClass: IllnessServiceStub},
        {provide: UserService, useClass: UserServiceStub},
        {provide: APP_CONFIG, useValue: config},
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    rendered = fixture.debugElement.nativeElement;
    taskService = TestBed.get(TaskService);
    illnessService = TestBed.get(IllnessService);
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("should get tasks", () => {
    const getTasks = spyOn(taskService, "getTasks").and.callThrough();
    component.currentData = [];
    component.page = 1;
    component.getTasks();
    expect(getTasks).toHaveBeenCalled();
    expect(component.currentData[0]).toBeTruthy();
  });

  it("should change page", () => {
    const getTasks = spyOn(component, "getTasks").and.callThrough();
    const getTasksService = spyOn(taskService, "getTasks").and.callThrough();
    component.changePage(2);
    expect(getTasks).toHaveBeenCalled();
    expect(getTasksService).toHaveBeenCalledWith(component.page, component.pageSize, component.roleFilter, component.userFilter);
  });

  it("should set page size", () => {
    const changePage = spyOn(component, "changePage").and.callThrough();
    component.setPageSize(component.pageSize);
    expect(changePage).not.toHaveBeenCalled();

    const newSize = component.pageSize + 1;
    component.setPageSize(newSize);
    expect(component.pageSize).toEqual(newSize);
    expect(changePage).toHaveBeenCalled();
  });

  it("should get tasks with empty role filter when user filter is set", () => {
    const spySetTasks = spyOn(taskService, "getTasks").and.callThrough();
    component.userFilter = "some filter";
    component.roleFilter = "collector";
    component.getTasks();
    expect(spySetTasks.calls.mostRecent().args[2]).toEqual("");
  });

  it("should reset user filter when role filter is setting", () => {
    component.userFilter = "some filter";
    component.setRoleFilter("reviewer");
    expect(component.userFilter).toEqual("");
  });

  it("should not set new role if current role equals to it", () => {
    const changePage = spyOn(component, "changePage").and.callThrough();
    component.setRoleFilter("collector");
    expect(changePage).not.toHaveBeenCalled();
  });

  it("should set currentData to empty array if service data is null", () => {
    component.page = 0;
    component.getTasks();
    expect(component.currentData).toEqual([]);
    expect(component.totalElements).toEqual(0);
  });

  it("should set currentData to empty array if gets error", () => {
    component.page = null;
    expect(() => component.getTasks()).toThrow();
    expect(component.currentData).toEqual([]);
    expect(component.totalElements).toEqual(0);
  });

  it("should append states to illnesses", () => {
    const tasks = {
      totalElements: 1,
      taskList: [
        {
          illnessList: [
            {
              idIcd10Code: "A00.0",
              name: "Cholera due to Vibrio cholerae 01, biovar cholerae",
              version: 1
            }
          ]
        }
      ]
    } as MITA.Task.Response;
    const illnesses = {
      "A00.0v1": {
        icd10Code: "A00.0",
        name: "Cholera due to Vibrio cholerae 01, biovar cholerae",
        prior: 0,
        source: "MICA",
        state: "COMPLETE",
        updatedDate: 1510088752251,
        version: 1
      } as MITA.Illness.Info
    };
    const tasksWithIllnessesStates = {
      totalElements: 1,
      taskList: [
        {
          illnessList: [
            {
              idIcd10Code: "A00.0",
              name: "Cholera due to Vibrio cholerae 01, biovar cholerae",
              version: 1,
              state: "COMPLETE"
            }
          ]
        }
      ]
    } as MITA.Task.Response;
    expect(component.appendStateToIllnesses(tasks, illnesses)).toEqual(tasksWithIllnessesStates);
  });

});
