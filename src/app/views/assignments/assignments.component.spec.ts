/* tslint:disable:no-unused-variable */
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { Router } from '@angular/router';

import { AssignmentsComponent } from "./assignments.component";
import { RouterOutletStubComponent } from '../../../test-helpers/router-stubs.spec';
@Component({
  selector: "mita-assignment-breadcrumbs",
  template: ""
})
class MitaBreadcrumbsComponentStub {}

describe("AssignmentsComponent", () => {
  let component: AssignmentsComponent;
  let fixture: ComponentFixture<AssignmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        AssignmentsComponent,
        MitaBreadcrumbsComponentStub,
        RouterOutletStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
