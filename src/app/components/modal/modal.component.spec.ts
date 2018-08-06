import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ModalComponent } from "./modal.component";
import { ModalService } from "./modal.service";
import { ModalServiceStub } from "../../../test-helpers/services-stubs.spec";
import { TestModalContentComponent } from "../../../test-helpers/components-stubs.spec";

describe("ModalComponent", () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let contentComponentFixture: ComponentFixture<TestModalContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalComponent,
        TestModalContentComponent
      ],
      providers: [
        {provide: ModalService, useClass: ModalServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    contentComponentFixture = TestBed.createComponent(TestModalContentComponent);
    component["content"] = contentComponentFixture.componentRef;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
