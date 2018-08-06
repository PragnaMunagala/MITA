/* tslint:disable:no-unused-variable */
import { Component, Input } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { TopHierarchyComponent } from "./top-hierarchy.component";
import { PipesModule } from "../../../pipes/pipes.module";
import { AssignmentsService } from "../assignments.service";
import { assignmentState } from "../../../app.config";
import { ActivatedRouteStub } from "../../../../test-helpers/router-stubs.spec";
import { AssignmentsServiceStub } from "../../../../test-helpers/services-stubs.spec";
const defaultRole: MITA.RoleName = "collector";
const assignmentData = require("../../../../test-helpers/test-data/assignment.json");
const collectorChapters = assignmentData.collector.chapter;
const collectorHead = assignmentData.collector.head;

@Component({
  selector: "mita-assigner",
  template: ""
})
class MitaAssignerStub {
  @Input() readOnly;
}

describe("TopHierarchyComponent", () => {
  let component: TopHierarchyComponent;
  let fixture: ComponentFixture<TopHierarchyComponent>;
  let assignmentSvc: AssignmentsServiceStub;
  let activatedRoute: ActivatedRouteStub;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          TopHierarchyComponent,
          MitaAssignerStub
        ],
        providers: [
          {provide: ActivatedRoute, useClass: ActivatedRouteStub},
          {provide: AssignmentsService, useClass: AssignmentsServiceStub}
        ],
        imports: [
          PipesModule,
          NgbModule.forRoot()
        ]
      })
      .compileComponents()
      .then(() => {
        activatedRoute = TestBed.get(ActivatedRoute);
        activatedRoute.testParams = {
          role: defaultRole
        };
        activatedRoute.snapShotUrl = ["assignments", "collector", "chapter"];
        fixture = TestBed.createComponent(TopHierarchyComponent);
        component = fixture.componentInstance;
        assignmentSvc = TestBed.get(AssignmentsService);
        component.ngOnInit();
        fixture.detectChanges();
      });
  }));

  afterEach(() => {
    component.ngOnDestroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });


  it("should show which chapter has been selected on the head view", () => {
    activatedRoute.snapShotUrl = ["assignments", "collector", "head"];
    assignmentSvc._items$ = collectorHead;
    assignmentSvc.currentView$ = {
      chapter: collectorChapters[0],
    };
    component.ngOnInit();
    fixture.detectChanges();
    const title = fixture.debugElement.nativeElement.querySelector("#title").innerHTML;
    expect(title).toMatch("CHAPTER I:");
  });

  it("should notify state if user wants to go deeper in the tree", () => {
    const spy = spyOn(assignmentSvc, "viewBlock");
    activatedRoute.snapShotUrl = ["assignments", "collector", "head"];
    assignmentSvc._items$ = collectorHead;
    assignmentSvc.currentView$ = {
      chapter: collectorChapters[0],
    };
    component.ngOnInit();
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css(".row-group"));
    rows[0].triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
