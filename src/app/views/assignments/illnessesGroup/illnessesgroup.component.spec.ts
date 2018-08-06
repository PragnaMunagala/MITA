/* tslint:disable:no-unused-variable */
import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import * as _ from "lodash";

import { IllnessesGroupComponent } from "./illnessesgroup.component";
import { assignmentState } from "../../../app.config";
import { ActivatedRouteStub } from "../../../../test-helpers/router-stubs.spec";
import { AssignmentsService } from "../assignments.service";
import { AssignmentsServiceStub } from "../../../../test-helpers/services-stubs.spec";

const defaultRole: MITA.RoleName = "collector";
const viewItems = require("../../../../test-helpers/test-data/assignment.json");
const collectorItems = viewItems.collector.section;

@Component({
  selector: "mita-assigner",
  template: ""
})
class MitaAssignerStub {
  @Output() selectAll: EventEmitter<boolean> = new EventEmitter();
  @Input() readOnly;
}

describe("IllnessesGroupComponent", () => {
  let component: IllnessesGroupComponent;
  let fixture: ComponentFixture<IllnessesGroupComponent>;
  let assignmentSvc: AssignmentsServiceStub;
  // row as should be formatted for the assignment service state when selecting a group
  const stubRow = {
      "id": 174,
      "block": "C06",
      "alreadyAssignedTo": [],
      "description": "Malignant neoplasm of other and unspecified parts of mouth",
      "subBlock": [{
        "parentGroupId": 174,
        "alreadyAssignedTo": [],
        "block": "C06",
        "description": "[Non-grouped] Malignant neoplasm of other and unspecified parts of mouth",
        "totalinblock": 4,
        "notassigned": 4,
        "notGrouped": true
      }],
      "totalinblock": 6,
      "notassigned": 6
    };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IllnessesGroupComponent,
        MitaAssignerStub
      ],
      providers: [
        {provide: ActivatedRoute, useClass: ActivatedRouteStub},
        {provide: AssignmentsService, useClass: AssignmentsServiceStub}
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessesGroupComponent);
    component = fixture.componentInstance;
    const activatedRoute = TestBed.get(ActivatedRoute);
    activatedRoute.testParams = {
      id: 1,
      role: defaultRole
    };
    assignmentSvc = TestBed.get(AssignmentsService);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should parse groups and create an show a table with rows of parents and children", fakeAsync(() => {
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const rendered = fixture.debugElement.query(By.css("table"));
    // numbered based on dummy data
    expect(rendered.queryAll(By.css(".section-row")).length).toBe(18);
  }));

  it("should select parent group on click", fakeAsync(() => {
    const selectGroup = spyOn(assignmentSvc, "selectGroup");
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const rendered = fixture.debugElement.query(By.css("table"));
    const firstRow = rendered.query(By.css(".section-row"));
    firstRow.triggerEventHandler("click", null);
    fixture.detectChanges();
    expect(selectGroup).toHaveBeenCalledWith(collectorItems[0]);
  }));

  it("should expand Row if clicked group is parent and has non-grouped illnesses", fakeAsync(() => {
    const selectGroup = spyOn(assignmentSvc, "selectGroup");
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const rendered = fixture.debugElement.query(By.css("table"));
    const rowWithSubBlock = rendered.queryAll(By.css(".section-row"))[7];
    rowWithSubBlock.triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    expect(rowWithSubBlock.nativeElement.outerHTML).toContain("arrow_drop_down");
  }));

  it("should expand Row if clicked group is parent and doesn't have non-grouped illnesses", fakeAsync(() => {
    const selectGroup = spyOn(assignmentSvc, "selectGroup");
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const rendered = fixture.debugElement.query(By.css("table"));
    const rowWithSubBlock = rendered.queryAll(By.css(".section-row"))[2];
    rowWithSubBlock.triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    expect(rowWithSubBlock.nativeElement.outerHTML).toContain("arrow_drop_down");
  }));

  it("should collapse Row if clicked group is parent and is already expanded", fakeAsync(() => {
    const selectGroup = spyOn(assignmentSvc, "selectGroup");
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const rowWithSubBlock = fixture.debugElement.queryAll(By.css(".section-row"))[7];
    expect(rowWithSubBlock.nativeElement.outerHTML).toContain("arrow_right");
    rowWithSubBlock.triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    expect(rowWithSubBlock.nativeElement.outerHTML).toContain("arrow_drop_down");
    rowWithSubBlock.triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    expect(rowWithSubBlock.nativeElement.outerHTML).toContain("arrow_right");
  }));

  it("should select subBlock on click", fakeAsync(() => {
    const selectGroup = spyOn(assignmentSvc, "selectGroup");
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const rendered = fixture.debugElement.query(By.css("table"));
    const rows = rendered.queryAll(By.css(".section-row"));
    const rowWithSubBlock = rows[7];
    rowWithSubBlock.triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    const rowSubBlock = rows[8];
    rowSubBlock.triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    expect(selectGroup).toHaveBeenCalledWith(stubRow);
  }));

  it("should select all blocks", fakeAsync(() => {
    const selectGroupAll = spyOn(assignmentSvc, "selectGroupAll");
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const mitaAssigner: MitaAssignerStub = fixture.debugElement.query(By.directive(MitaAssignerStub)).componentInstance;
    mitaAssigner.selectAll.emit(true);
    expect(selectGroupAll).toHaveBeenCalled();
  }));

  it("should be able to detect if a subBlock is already selected and style it", fakeAsync(() => {
    assignmentSvc._items$ = collectorItems;
    component.ngOnInit();
    fixture.detectChanges();
    let selectedSubgroups = fixture.debugElement.queryAll(By.css(".table-success.subgroup")).length;
    expect(selectedSubgroups).toBe(0);
    const rows = fixture.debugElement.queryAll(By.css(".section-row"));
    rows[7].triggerEventHandler("click", new Event("click"));
    fixture.detectChanges();
    rows[8].triggerEventHandler("click", new Event("click"));
    assignmentSvc.setSelected$([stubRow]);
    fixture.detectChanges();
    selectedSubgroups = fixture.debugElement.queryAll(By.css(".table-success.subgroup")).length;
    expect(selectedSubgroups).toBe(1);
    rows[8].triggerEventHandler("click", new Event("click"));
    assignmentSvc.setSelected$([]);
    fixture.detectChanges();
    selectedSubgroups = fixture.debugElement.queryAll(By.css(".table-success.subgroup")).length;
    expect(selectedSubgroups).toBe(0);
  }));

});
