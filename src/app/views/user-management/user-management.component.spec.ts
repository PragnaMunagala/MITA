import { Component, Input } from "@angular/core";
import {
  async,
  ComponentFixture,
  TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UserManagementComponent } from "./user-management.component";
import { UserService } from "../../services";
import { UserServiceStub } from "../../../test-helpers/services-stubs.spec";
const userDataFake = require("../../../test-helpers/test-data/user.json");

@Component({
  selector: "mita-user-table",
  template: ""
})
export class UserTableStub {
  @Input() users;
  @Input() role;
}

describe("UserManagementComponent", () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgbModule.forRoot()
      ],
      declarations: [
        UserManagementComponent,
        UserTableStub
      ],
      providers: [
        { provide: UserService, useClass: UserServiceStub},
        NgbModal
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(UserManagementComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));


  it("should create and destroy OK", () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });

  it("should display link to show interface to add new user", () => {
    const link = fixture.debugElement.query(By.css("a")).nativeElement.getAttribute("href");
    expect(link).toEqual("/users/new");
  });

  it("should display link to show interface to add new user", () => {
    const link = fixture.debugElement.query(By.css("a")).nativeElement.getAttribute("href");
    expect(link).toEqual("/users/new");
  });

  it("should remove collector", () => {
    component.collectors = userDataFake.allTupleRole[0];
    fixture.detectChanges();
    const len = component.collectors.length;
    component.removeCollector(0);
    expect(component.collectors.length).toBeLessThan(len);
  });

  it("should remove reviewer", () => {
    component.reviewers = userDataFake.allTupleRole[1];
    fixture.detectChanges();
    const len = component.reviewers.length;
    component.removeReviewer(0);
    expect(component.reviewers.length).toBeLessThan(len);
  });

  it("should remove admin", () => {
    component.administrators = userDataFake.allTupleRole[2];
    fixture.detectChanges();
    const len = component.administrators.length;
    component.removeAdministrator(0);
    expect(component.administrators.length).toBeLessThan(len);
  });

});
