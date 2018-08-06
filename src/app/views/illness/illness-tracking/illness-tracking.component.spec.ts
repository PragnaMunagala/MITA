import { Observable } from "rxjs/Observable";
/**
 * Created by sergeyyudintsev on 27.07.17.
 */
import { async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { IllnessTrackingComponent } from "./illness-tracking.component";
import { IllnessTableComponent } from "./illness-table/illness-table.component";
import { IllnessService } from "../../../services/illness.service";
import { IllnessServiceStub } from "../../../../test-helpers/services-stubs.spec";
import { ActivatedRouteStub } from "../../../../test-helpers/router-stubs.spec";
import {IllnessProgressComponent} from "./illness-progress/illness-progress.component";
const fakeIllnessData = require("../../../../test-helpers/test-data/illness.json");

describe("IllnessTrackingComponent", () => {
  let component: IllnessTrackingComponent;
  let fixture: ComponentFixture<IllnessTrackingComponent>;
  let rendered: Element;
  let illnessSvc: IllnessServiceStub;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IllnessTrackingComponent,
        IllnessTableComponent,
        IllnessProgressComponent
      ],
      imports: [
        NgbModule.forRoot()
      ],
      providers: [
        {provide: ActivatedRoute, useClass: ActivatedRouteStub},
        {provide: IllnessService, useClass: IllnessServiceStub}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    rendered = fixture.debugElement.nativeElement;
    illnessSvc = TestBed.get(IllnessService);
  });

  it("should create and destroy OK", () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });

  it("should change page", () => {
    const getIlnesses = spyOn(component, "getIlnesses").and.callThrough();
    const getTracking = spyOn(illnessSvc, "getTracking").and.callThrough();
    component.changePage(2);
    expect(getIlnesses).toHaveBeenCalled();
    expect(getTracking).toHaveBeenCalledWith(component.filterByICD, component.page, component.pageSize);
  });

  // it("should set currentData to empty array if service data is null", () => {
  //   component.page = 23;
  //   component.getIlnesses();
  //   expect(component.currentData).toEqual([]);
  //   expect(component.totalElements).toEqual(0);
  // });

  it("should set currentData to empty array if service data is null", () => {
    component.page = null;
    const getTracking = spyOn(illnessSvc, "getTracking").and.callThrough();
    component.getIlnesses();
    expect(component.currentData).toEqual([]);
    expect(component.totalElements).toEqual(0);
  });

  it("should set currentData to empty array if service data returns error", () => {
    const getTracking = spyOn(illnessSvc, "getTracking").and.callFake(() => Observable.throw(Error("stub")));
    expect(() => component.getIlnesses()).toThrow();
    expect(component.currentData).toEqual([]);
    expect(component.totalElements).toEqual(0);
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

  it("should set filter", () => {
    const changePage = spyOn(component, "changePage").and.callThrough();
    component.setLetter("A");
    expect(changePage).not.toHaveBeenCalled();

    component.setLetter("B");
    expect(component.filterByICD).toEqual("B");
    expect(changePage).toHaveBeenCalled();
  });

  it("should select illness", () => {
    const getProgress = spyOn(component, "getProgress").and.callThrough();
    component.selectIllness(0);
    expect(getProgress).toHaveBeenCalled();
  });

  it("should not select illness twice", () => {
    const getProgress = spyOn(component, "getProgress").and.callThrough();
    component.selectedIllness = component.currentData[0];
    component.selectIllness(0);
    expect(getProgress).not.toHaveBeenCalled();
  });

  it("should get progress", () => {
    component.selectedIllness = component.currentData[0];
    component.getProgress();
    expect(component.progress).toBeTruthy();
  });

});
