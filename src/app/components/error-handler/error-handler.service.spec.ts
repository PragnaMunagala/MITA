import { ErrorHandlerModalComponent } from "./error-handler.component";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { Component } from "@angular/core";
import { TestBed, inject } from "@angular/core/testing";
import { MITAErrorHandlerService } from "./error-handler.service";
import { ModalService } from "../modal/modal.service";
import { ModalServiceStub } from "../../../test-helpers/services-stubs.spec";
import { ModalComponent } from "../modal/modal.component";
import {TestAppComponent, TestModalContentComponent} from "../../../test-helpers/components-stubs.spec";

describe("MITAErrorHandlerService", () => {
  let svc: MITAErrorHandlerService;
  let modalSvc: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestAppComponent,
        ErrorHandlerModalComponent
      ],
      providers: [
        MITAErrorHandlerService,
        {provide: ModalService, useClass: ModalServiceStub}
      ]
    });
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          ErrorHandlerModalComponent
        ],
        bootstrap: [TestAppComponent]
      },
    });
    svc = TestBed.get(MITAErrorHandlerService);
    modalSvc = TestBed.get(ModalService);
  });

  it("should be created", inject([MITAErrorHandlerService], (service: MITAErrorHandlerService) => {
    expect(service).toBeTruthy();
  }));

  it("should handle errors which follow MITA Error Response schema", () => {
    const errorStub = {
      json() {
        return {
          message: "An error",
          reason: "A reson",
          statusCode: 500
        };
      }
    };
    const modalOpen = spyOn(modalSvc, "open").and.callThrough();
    const consoleSpy = spyOn(console, "error");
    svc.handleError(errorStub);
    expect(consoleSpy).toHaveBeenCalled();
    expect(modalOpen).toHaveBeenCalled();
  });

  it("should be able to handle errors which don't follow MITA Error Response schema", () => {
    const modalOpen = spyOn(modalSvc, "open").and.callThrough();
    const consoleSpy = spyOn(console, "error");
    svc.handleError(new Error("test"));
    expect(consoleSpy).toHaveBeenCalled();
    expect(modalOpen).toHaveBeenCalled();
  });
});
