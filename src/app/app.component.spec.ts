/* tslint:disable:no-unused-variable */
import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";

import { AppComponent } from "./app.component";
import { navItems, NAV_ITEMS } from "./app.config";
import { HeaderComponent, NavComponent } from "./components/header";
import {
  AuthService,
  IdleDetectorService
} from "./services";
import {
  AuthServiceStub,
  IdleDetectorServiceStub
} from "../test-helpers/services-stubs.spec";

class LambdaWarmerServiceStub {
  warmLambdaServices() {
    return new BehaviorSubject([true]);
  }
}

@Component({
  selector: "MITA-header",
  template: ""
})
class HeaderStub {}

@Component({
  selector: "empty",
  template: ""
})
class BlankCmp {}

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let lambdaWarmer: LambdaWarmerServiceStub;
  let pageTitle = "A Page Title";
  let router: Router;
  let defaultRoute = "summary";
  let idleSvc: IdleDetectorService;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [AppComponent, BlankCmp, HeaderStub],
        providers: [
          {provide: NAV_ITEMS, useValue: navItems},
          {provide: AuthService, useClass: AuthServiceStub},
          {provide: IdleDetectorService, useClass: IdleDetectorServiceStub}
        ],
        imports: [
          RouterTestingModule.withRoutes(
            [{path: "", component: BlankCmp},
            {path: defaultRoute, component: BlankCmp, data: {title: defaultRoute}}]
          )
        ]

      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        router = TestBed.get(Router);
        idleSvc = TestBed.get(IdleDetectorService);
        fixture.detectChanges();
      });
  }));

  it("should create and follow Angular lifecycle hooks", () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });


  it("should navigate to summary and update title", fakeAsync(() => {
    router.navigateByUrl(defaultRoute);
    const title = spyOn(component["title"], "setTitle");
    tick();
    expect(title).toHaveBeenCalledWith("MITA - " + defaultRoute);
  }));

  it("should stop idleness counter when there's no logged in user", async(() => {
    const stop = spyOn(idleSvc, "stop");
    component.ngOnInit();
    expect(stop).toHaveBeenCalled();
  }));

  it("should start idleness counter when user logs in", fakeAsync(() => {
    const authSvc = TestBed.get(AuthService);
    const stop = spyOn(idleSvc, "stop");
    const start = spyOn(idleSvc, "start");
    component.ngOnInit();
    expect(stop).toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
    authSvc.testUser = "collector";
    tick();
    stop.calls.reset();
    expect(stop).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
  }));

});
