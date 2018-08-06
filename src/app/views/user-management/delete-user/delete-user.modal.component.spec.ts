/**
 * Created by sergeyyudintsev on 10/07/17.
 */
import {async, ComponentFixture, fakeAsync, TestBed} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { environment } from "../../../../environments/environment";

import { DeleteUserModalComponent } from "./delete-user.modal.component";
import { UserService } from "../../../services/user.service";
import { AuthService } from "../../../services/auth.service";
import { AuthServiceStub, UserServiceStub } from "../../../../test-helpers/services-stubs.spec";
import { ModalService } from "../../../components/modal/modal.service";
import {Observable} from "rxjs";
import {ResponseOptions} from "@angular/http";

const userDataFake = require("../../../../test-helpers/test-data/user.json");

describe("DeleteUserModalComponent", () => {
  let component: DeleteUserModalComponent;
  let fixture: ComponentFixture<DeleteUserModalComponent>;
  let rendered: Element;
  let userSvc: UserServiceStub;
  let authSvc: AuthServiceStub;
  let modalSvc: ModalService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteUserModalComponent ],
      providers: [
        { provide: UserService, useClass: UserServiceStub },
        { provide: AuthService, useClass: AuthServiceStub },
        ModalService
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(DeleteUserModalComponent);
      component = fixture.componentInstance;
      component.user = userDataFake.allTupleRole[0][0];
      rendered = fixture.debugElement.nativeElement;
      authSvc = TestBed.get(AuthService);
      userSvc = TestBed.get(UserService);
      modalSvc = TestBed.get(ModalService);
      component.closeModal = (res: any) => {};
      fixture.detectChanges();
    });
    spyOn(console, "log");
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display delete button with correct environment", () => {
    const btnText = fixture.debugElement.query(By.css(".btn-warning")).nativeElement.innerText.toUpperCase();
    if (environment.production) {
      expect(btnText).toContain("PROD");
    } else {
      expect(btnText).toContain("DEV");
    }
  });

  it("should delete user from both PSQL and Auth0", () => {
    const btn = fixture.debugElement.query(By.css(".btn-danger")).nativeElement;
    const deleteFromPostgres = spyOn(userSvc, "removeUser").and.callThrough();
    const deleteFromAuth0 = spyOn(authSvc, "removeUser").and.callThrough();
    btn.click();
    expect(deleteFromAuth0).toHaveBeenCalledWith(component.user.email);
    expect(deleteFromPostgres).toHaveBeenCalledWith(component.user.userId);
  });

  it("should delete user from PSQL only", () => {
    const btn = fixture.debugElement.query(By.css(".btn-warning")).nativeElement;
    const deleteFromPostgres = spyOn(userSvc, "removeUser").and.callThrough();
    const deleteFromAuth0 = spyOn(authSvc, "removeUser").and.callThrough();
    btn.click();
    expect(deleteFromAuth0).not.toHaveBeenCalled();
    expect(deleteFromPostgres).toHaveBeenCalledWith(component.user.userId);
  });

  it("should allow user to close modal using 'CANCEL' button", () => {
    const btn = fixture.debugElement.query(By.css(".btn:last-child")).nativeElement;
    const closeModal = spyOn(component, "closeModal").and.callThrough();
    btn.click();
    expect(closeModal).toHaveBeenCalled();
  });

  it("removeUser method should handle error", () => {
    const onError = spyOn(component, "onError").and.callThrough();
    const removeUser = spyOn(userSvc, "removeUser");
    const responseOptions = {
      status: 500,
      body: {message: "everything is bad"}
    };

    removeUser.and.returnValue(Observable.throw(new Response(new ResponseOptions(responseOptions))));
    component.user = userDataFake.email;
    component.removeUser();
    expect(onError).toHaveBeenCalled();
  });

  it("removeUser method should handle res", () => {
    const onError = spyOn(component, "onError").and.callThrough();
    const removeUser = spyOn(userSvc, "removeUser");
    const closeModal = spyOn(component, "closeModal");
    const responseOptions = {
      status: 200,
      body: {message: "everything is good"}
    };

    removeUser.and.returnValue(Observable.of(new Response(new ResponseOptions(responseOptions))));
    component.user = userDataFake.email;
    component.removeUser();
    expect(onError).not.toHaveBeenCalled();
    expect(component.requesting).toBeFalsy();
    expect(component.errorMessage.status).toEqual("");
    expect(closeModal).toHaveBeenCalledWith(true);
  });

  it("removeUserWithAccess method should handle error", () => {
    const onError = spyOn(component, "onError").and.callThrough();
    const removeAuthUser = spyOn(authSvc, "removeUser");
    const removeUser = spyOn(userSvc, "removeUser");
    const responseOptions = {
      status: 500,
      body: {message: "everything is bad"}
    };

    removeUser.and.returnValue(Observable.throw(new Response(new ResponseOptions(responseOptions))));
    removeAuthUser.and.returnValue(Observable.throw(new Response(new ResponseOptions(responseOptions))));
    component.user = userDataFake.email;
    component.user.email = null;
    component.removeUserWithAccess();
    expect(onError).toHaveBeenCalled();
  });

  it("removeUserWithAccess method should handle res", () => {
    const onError = spyOn(component, "onError").and.callThrough();
    const closeModal = spyOn(component, "closeModal");
    const removeAuthUser = spyOn(authSvc, "removeUser");
    const removeUser = spyOn(userSvc, "removeUser");
    const responseOptions = {
      status: 200,
      body: {message: "everything is good"}
    };

    removeUser.and.returnValue(Observable.of(new Response(new ResponseOptions(responseOptions))));
    removeAuthUser.and.returnValue(Observable.of(new Response(new ResponseOptions(responseOptions))));
    component.user = userDataFake.email;
    component.removeUserWithAccess();
    expect(onError).not.toHaveBeenCalled();
    expect(component.requesting).toBeFalsy();
    expect(component.errorMessage.status).toEqual("");
    expect(closeModal).toHaveBeenCalledWith(true);
  });


  it("should set error", () => {
    const error = {
      message: "Some error message",
      error_description: "Some error description"
    };
    component.onError(error);
    expect(component.errorMessage.message).toEqual(error.message);

    error.message = "";
    component.onError(error);
    expect(component.errorMessage.message).toEqual(error.error_description);
  });

  it("check Prod/Dev environment", () => {
    expect(component.environmentValue).toEqual("Dev");
    environment.production = true;
    const newFixture = TestBed.createComponent(DeleteUserModalComponent);
    const newComponent = newFixture.componentInstance;
    expect(newComponent.environmentValue).toEqual("Prod");
  })

});
