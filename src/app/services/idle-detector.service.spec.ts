import {
  TestBed,
  inject,
  fakeAsync,
  tick,
  discardPeriodicTasks
} from "@angular/core/testing";
import { Router } from "@angular/router";
import { IdleDetectorService } from "./idle-detector.service";
import { APP_CONFIG } from "../app.config";
import { AuthService } from "./auth.service";
import { AuthServiceStub } from "../../test-helpers/services-stubs.spec";
import { RouterStub } from "../../test-helpers/router-stubs.spec";

describe("IdleDetectorService", () => {
  let svc: IdleDetectorService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IdleDetectorService,
        { provide: APP_CONFIG, useValue: {idleTime: 500}},
        { provide: AuthService, useClass: AuthServiceStub},
        { provide: Router, useClass: RouterStub}
      ]
    });

    svc = TestBed.get(IdleDetectorService);
    router = TestBed.get(Router);
  });

  it("should create", inject([IdleDetectorService], (service: IdleDetectorService) => {
    expect(service).toBeTruthy();
  }));

  it("should navigate to 'inactive' after timer has started", fakeAsync(() => {
    const spy = spyOn(router, "navigate");
    svc.start();
    tick(500);
    expect(spy).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it("should reset timer after restart if there is activity", () => {
    svc.start();
    let timer1 = svc["timerSrc"];
    window.document.dispatchEvent(new Event("mousemove"));
    let timer2 = svc["timerSrc"];
    expect(timer1).not.toEqual(timer2);
  });

  it("should safeguard resetter from calling undefined if timer not created yet", () => {
    const spy = spyOn(window, "clearInterval");
    expect(svc["timerSrc"]).toBeFalsy();
    (<any>svc).resetTimer();
    expect(spy).not.toHaveBeenCalled();
  });

  it("should ignore stop command if timer hasn't started", () => {
    const spy = spyOn(window, "clearInterval");
    svc.stop();
    expect(spy).not.toHaveBeenCalled();
  });

  it("should stop timer if it has one and stop has been called", () => {
    const spy = spyOn(window, "clearInterval");
    svc.start();
    svc.stop();
    expect(spy).toHaveBeenCalled();
  });
});
