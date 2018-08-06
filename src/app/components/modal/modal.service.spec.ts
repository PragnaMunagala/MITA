/**
 * Created by sergeyyudintsev on 05.09.17.
 */
import {
  inject,
  fakeAsync,
  async,
  tick,
  TestBed
} from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import {
  Http,
  ConnectionBackend,
  BaseRequestOptions,
  Response,
  ResponseOptions
} from "@angular/http";
import * as _ from "lodash";
import { config, APP_CONFIG } from "../../app.config";
import { ModalService } from "./modal.service";
import {TestAppComponent, TestModalContentComponent} from "../../../test-helpers/components-stubs.spec";
import {ModalComponent} from "./modal.component";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {BrowserModule} from "@angular/platform-browser";

describe("TaskService", () => {
  let backend: MockBackend;
  let svc: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalComponent,
        TestModalContentComponent,
        TestAppComponent
      ],
      imports: [BrowserModule],
      providers: [
        BaseRequestOptions,
        MockBackend,
        ModalService,
        {provide: APP_CONFIG, useValue: config},
        {
          provide: Http,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    });
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          ModalComponent,
          TestModalContentComponent
        ],
        bootstrap: [TestAppComponent]
      },
    });

    backend = TestBed.get(MockBackend);
    svc = TestBed.get(ModalService);
  });

  it("should create", inject([ModalService], (service: ModalService) => {
    expect(service).toBeTruthy();
  }));

  it("should create component", () => {
    const componentRef = svc["createComponent"](ModalComponent);
    expect(componentRef).toBeTruthy();
  });

  it("should create component node", () => {
    const componentRef = svc["createComponent"](ModalComponent);
    const componentNode = svc["getComponentNode"](componentRef);
    expect(componentNode).toBeTruthy();
  });

  it("should open and close modal", async(() => {
    const componentRef = svc["createComponent"](TestAppComponent);
    const modalRef = svc["createComponent"](ModalComponent);
    const node = svc["getComponentNode"](componentRef);
    const modalNode = svc["getComponentNode"](modalRef);
    const _getComponentNode = spyOn(svc as any, "getComponentNode").and.returnValues(node, modalNode);
    const contentRef = svc.open(TestModalContentComponent);
    const close = spyOn(contentRef.instance, "closeModal").and.callThrough();
    expect(contentRef).toBeTruthy();
    contentRef.instance.closeModal(1);
    expect(close).toHaveBeenCalled();
  }));

  it("should destroy modal", async(() => {
    const componentRef = svc["createComponent"](TestAppComponent);
    const modalRef = svc["createComponent"](ModalComponent);
    const node = svc["getComponentNode"](componentRef);
    const modalNode = svc["getComponentNode"](modalRef);
    const _getComponentNode = spyOn(svc as any, "getComponentNode").and.returnValues(node, modalNode);
    const createComponent = spyOn(svc as any, "createComponent").and.callThrough();
    const contentRef = svc.open(TestModalContentComponent);
    const trueModalRef = createComponent.calls.first().returnValue;
    let result = false;
    expect(contentRef).toBeTruthy();
    contentRef.instance.onModalClose.subscribe(res => result = true);
    trueModalRef.destroy();
    expect(result).toBeTruthy();
  }));

});
