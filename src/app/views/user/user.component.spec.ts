/* tslint:disable:no-unused-variable */
import { async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { UserComponent } from "./user.component";
import { UserService } from "../../services/user.service";
import { TaskService } from "../../services/task.service";
import { TitleCasePipe } from "../../pipes/title-case.pipe";
import { UserServiceStub } from "../../../test-helpers/services-stubs.spec";
import { TaskServiceStub } from "../../../test-helpers/services-stubs.spec";
import { ActivatedRouteStub } from "../../../test-helpers/router-stubs.spec";
const fakeTaskData = require("../../../test-helpers/test-data/tasks.json");

describe("UserComponent", () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let rendered: Element;
  let userSvc: UserServiceStub;
  let taskSvc: TaskServiceStub;
  let activatedRoute: ActivatedRouteStub;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserComponent,
        TitleCasePipe
      ],
      providers: [
        {provide: UserService, useClass: UserServiceStub},
        {provide: ActivatedRoute, useClass: ActivatedRouteStub},
        {provide: TaskService, useClass: TaskServiceStub}
      ]
    })
    .compileComponents()
    .then(() => {
      activatedRoute = TestBed.get(ActivatedRoute);
      activatedRoute.testParams = {
        role: "collector"
      };
      fixture = TestBed.createComponent(UserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      rendered = fixture.debugElement.nativeElement;
      userSvc = TestBed.get(UserService);
      taskSvc = TestBed.get(TaskService);
    });
  }));

  it("should create and destroy OK", () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });

  it("should display a message if no tasks have been created yet", () => {
    userSvc._users = [];
    fixture.detectChanges();
    let noTask = fixture.debugElement.query(By.css("#no-task"));
    expect(noTask).toBeTruthy();
  });

  it("should display history of tasks when selecting a user directly", () => {
    activatedRoute.testParams = {role: "reviewer"};
    let user = {id: 5, text: "Laura Fowler"};
    const button = fixture.debugElement.query(By.css("#history-selector"));
    button.triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    const historyItems = fixture.debugElement.queryAll(By.css(".history-item"));
    expect(historyItems.length).toBeGreaterThan(0);
  });

  it("should display history of tasks when clicking on an ongoing task", () => {
    const historyItemsInit = fixture.debugElement.queryAll(By.css(".history-item"));
    expect(historyItemsInit.length).toBe(0);
    const ongoingTasks = fixture.debugElement.queryAll(By.css(".row-current"));
    ongoingTasks[0].triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    const historyItems = fixture.debugElement.queryAll(By.css(".history-item"));
    expect(historyItems.length).toBeGreaterThan(0);
  });

  it("should not display history items if users have not been loaded", () => {
    userSvc._usersByRole = [];
    fixture.detectChanges();
    const ongoingTasks = fixture.debugElement.queryAll(By.css(".row-current"));
    ongoingTasks[0].triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    const historyItems = fixture.debugElement.queryAll(By.css(".history-item"));
    expect(historyItems.length).toBe(0);
  });

  it("should change list of users when navigating a different role's list", () => {
    const ongoingTasksCollector = fixture.debugElement.queryAll(By.css(".row-current"));
    expect(ongoingTasksCollector.length).toBe(fakeTaskData.current["collectors"].length);
    userSvc._users = fakeTaskData["current-reviewer"]["reviewers"];
    activatedRoute.testParams = { role: "reviewer" };
    fixture.detectChanges();
    const ongoingTasksReviewer = fixture.debugElement.queryAll(By.css(".row-current"));
    expect(ongoingTasksReviewer.length).toBe(fakeTaskData["current-reviewer"]["reviewers"].length);
  });

  it("should display 'reset task' button only for collectors", fakeAsync(() => {
    const btnCollector = fixture.debugElement.queryAll(By.css(".row-current>td>.btn"))[0];
    expect(btnCollector).toBeTruthy();
    userSvc._users = fakeTaskData["current-reviewer"]["reviewers"];
    activatedRoute.testParams = { role: "reviewer" };
    fixture.detectChanges();
    const btnReviewer = fixture.debugElement.queryAll(By.css(".row-current>td>.btn"))[0];
    expect(btnReviewer).toBeFalsy();
  }));

  it("should reset task", fakeAsync(() => {
    const btn = fixture.debugElement.queryAll(By.css(".row-current>td>.btn"))[0].nativeElement;
    const resetTask = spyOn(taskSvc, "resetTask").and.callThrough();
    const len = component.currentData.length;
    btn.click();
    expect(resetTask).toHaveBeenCalled();
    expect(component.currentData.length).toBeLessThan(len);
  }));

  it("should throw error if unable to reset task", fakeAsync(() => {
    spyOn(console, "log");
    component.loadingCurrentData = true;
    component["resetTask"](null);
    expect(component.loadingCurrentData).toEqual(false);
  }));

});
