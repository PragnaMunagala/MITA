import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { HeaderUserComponent } from "./user.component";
import { AuthService } from "../../../services";
import { AuthServiceStub } from "../../../../test-helpers/services-stubs.spec";
import { RouterStub } from "../../../../test-helpers/router-stubs.spec";


describe("HeaderUserComponent", () => {
  let component: HeaderUserComponent;
  let fixture: ComponentFixture<HeaderUserComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [ HeaderUserComponent ],
        providers: [
          {provide: Router, useClass: RouterStub},
          {provide: AuthService, useClass: AuthServiceStub}
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HeaderUserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it(`should log out user on button click`, () => {
    const auth = TestBed.get(AuthService);
    const router = TestBed.get(Router);
    const logout = spyOn(auth, "logout");
    const navigate = spyOn(router, "navigate");
    const rendered = fixture.debugElement.nativeElement;
    const button = rendered.querySelector("button");
    button.click();
    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });
});
