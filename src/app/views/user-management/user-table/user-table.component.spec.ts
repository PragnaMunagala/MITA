import { async, ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { UserTableComponent } from "./user-table.component";
import { DeleteUserModalComponent } from "../delete-user/delete-user.modal.component";
const userDataFake = require("../../../../test-helpers/test-data/user.json");
import {EventEmitter} from "@angular/core";
import {ModalService} from "../../../components/modal/modal.service";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {ModalComponent} from "../../../components/modal/modal.component";
import {TestAppComponent, TestModalContentComponent} from "../../../../test-helpers/components-stubs.spec";

describe("UserTableComponent", () => {
  let modalService: ModalService;
  let component: UserTableComponent;
  let fixture: ComponentFixture<UserTableComponent>;
  let rendered: Element;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserTableComponent,
        ModalComponent,
        TestAppComponent,
        TestModalContentComponent
      ],
      providers: [
        ModalService
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          ModalComponent,
          TestModalContentComponent
        ],
        bootstrap: [TestAppComponent]
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    modalService = TestBed.get(ModalService);
    // There is a lot output related to bootstrap modal
    // Spying is making those messages not to show in runner
    // TODO: Consider if using own modal is better
    spyOn(console, "log");
    spyOn(console, "error");
  });

  it("should create", () => {
    component.role = "collector";
    component.users = userDataFake.allTupleRole[0];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should display message if no component is created with no users", () => {
    component.role = "reviewer";
    fixture.detectChanges();
    const table = fixture.debugElement.query(By.css("table"));
    expect(table).toBeFalsy();
    const msgEl = fixture.debugElement.query(By.css(".alert")).nativeElement.innerHTML;
    expect(msgEl).toMatch("No reviewer registered yet");
  });

  it("should display rows of info for each collector", () => {
    component.role = "collector";
    component.users = userDataFake.allTupleRole[0];
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css(".user-row"));
    expect(rows.length).toEqual(userDataFake.allTupleRole[0].length);
  });

  it("should display rows of info for each reviewer", () => {
    component.role = "reviewer";
    component.users = userDataFake.allTupleRole[1];
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css(".user-row"));
    expect(rows.length).toEqual(userDataFake.allTupleRole[1].length);
  });

  it("should open a modal when click delete button", () => {
    component.role = "collector";
    component.users = userDataFake.allTupleRole[0];
    fixture.detectChanges();
    const btn = fixture.debugElement.queryAll(By.css(".btn-link"))[0].nativeElement;
    const openModal = spyOn(modalService, "open").and.returnValue(true);
    btn.click();
    fixture.detectChanges();
    expect(openModal).toHaveBeenCalled();
    expect(component.modalRef).toBeTruthy();
  });

  it("should handle result of modal closing", () => {
    const componentRef = modalService["createComponent"](TestAppComponent);
    const modalRef = modalService["createComponent"](ModalComponent);
    const node = modalService["getComponentNode"](componentRef);
    const modalNode = modalService["getComponentNode"](modalRef);
    const _getComponentNode = spyOn(modalService as any, "getComponentNode").and.returnValues(node, modalNode);
    const createComponent = spyOn(modalService as any, "createComponent").and.callThrough();
    const contentRef = modalService.open(TestModalContentComponent);
    const trueModalRef = createComponent.calls.first().returnValue;
    const open = spyOn(modalService, "open").and.returnValue(contentRef);
    const idx = 0;
    let result;

    component.users = userDataFake.allTupleRole[0];
    component.openModalDialog(idx);
    component.removeUserFromView.subscribe(res => result = res);
    trueModalRef.instance.closeModal(true);
    expect(result).toEqual(idx);
  });

});
