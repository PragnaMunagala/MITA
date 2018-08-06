/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import * as _ from "lodash";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BreadcrumbsComponent } from "./breadcrumbs.component";
import { PipesModule } from "../../../pipes/pipes.module";
import { AssignmentsService } from "../assignments.service";
import { AssignmentsServiceStub } from "../../../../test-helpers/services-stubs.spec";

const assignmentData = require("../../../../test-helpers/test-data/assignment.json");
const collectorChapters = assignmentData.collector.chapter;
const collectorHead = assignmentData.collector.head;


describe("BreadcrumbsComponent", () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let assignmentSvc: AssignmentsServiceStub;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BreadcrumbsComponent
      ],
      imports: [
        NgbModule.forRoot(),
        PipesModule
      ],
      providers: [
        {provide: AssignmentsService, useClass: AssignmentsServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    assignmentSvc = TestBed.get(AssignmentsService);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("don't show any breadcrumb when there is no role", () => {
    let initState = {
      current:  {},
      role: "",
      view: "head"
    };
    assignmentSvc.setState(initState);
    fixture.detectChanges();
    let items = fixture.debugElement.queryAll(By.css(".breadcrumb-item"));
    expect(items.length).toBe(0);
  });

  it("should display one breadcrumb for role on chapter view", () => {
    let initState = {
      current:  {},
      role: "collector",
      view: "chapter"
    };
    assignmentSvc.setState(initState);
    fixture.detectChanges();
    let items = fixture.debugElement.queryAll(By.css(".breadcrumb-item"));
    expect(items.length).toBe(1);
  });

  it("should display two breadcrumbs on head view", () => {
    let initState = {
      current:  {
        chapter: collectorChapters[0]
      },
      role: "collector",
      view: "head"
    };
    assignmentSvc.setState(initState);
    fixture.detectChanges();
    let items = fixture.debugElement.queryAll(By.css(".breadcrumb-item"));
    expect(items.length).toBe(2);
  });

  it("should display three breadcrumbs on section view", () => {
    let initState = {
      current:  {
        chapter: collectorChapters[0],
        head: collectorHead[0]
      },
      role: "collector",
      view: "section"
    };
    assignmentSvc.setState(initState);
    fixture.detectChanges();
    let items = fixture.debugElement.queryAll(By.css(".breadcrumb-item"));
    expect(items.length).toBe(3);
  });

  it("should notify state when navigation link is clicked", fakeAsync(() => {
    let spy = spyOn(assignmentSvc, "resetFrom");
    let initState = {
      current:  {
        chapter: collectorChapters[0],
        head: collectorHead[0]
      },
      role: "collector",
      view: "section"
    };
    assignmentSvc.setState(initState);
    fixture.detectChanges();
    let items = fixture.debugElement.queryAll(By.css(".breadcrumb-item"));
    let link = items[1].query(By.css("a"));
    link.triggerEventHandler("click", new Event("click"));
    tick();
    expect(spy).toHaveBeenCalled();
  }));
});
