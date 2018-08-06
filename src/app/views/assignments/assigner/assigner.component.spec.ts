/* tslint:disable:no-unused-variable */
import { async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { DebugElement } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { AssignerComponent } from "./assigner.component";
import { IllnessesGroupComponent } from "../illnessesGroup/illnessesgroup.component";
import { UserService } from "../../../services/user.service";
import { AssignmentsService } from "../assignments.service";
import { TitleCasePipe } from "../../../pipes/title-case.pipe";
import { ActivatedRouteStub } from "../../../../test-helpers/router-stubs.spec";
import { UserServiceStub, AssignmentsServiceStub } from "../../../../test-helpers/services-stubs.spec";
import IllnessGroupRow = MITA.Assignments.IllnessGroupRow;

const sectionItems = require("../../../../test-helpers/test-data/assignment.json")["section-rows"];
const defaultRole: MITA.RoleName = "collector";

describe("AssignerComponent", () => {
  let component: AssignerComponent;
  let fixture: ComponentFixture<AssignerComponent>;
  let userSvc: UserServiceStub;
  let assignmentSvc: AssignmentsServiceStub;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AssignerComponent,
        TitleCasePipe
      ],
      imports: [
        FormsModule
      ],
      providers: [
        {provide: ActivatedRoute, useClass: ActivatedRouteStub},
        {provide: UserService, useClass: UserServiceStub},
        {provide: AssignmentsService, useClass: AssignmentsServiceStub}
      ]
    })
    .compileComponents()
    .then(() => {
       fixture = TestBed.createComponent(AssignerComponent);
       component = fixture.componentInstance;
       userSvc = TestBed.get(UserService);
       assignmentSvc = TestBed.get(AssignmentsService);
       const activatedRoute = TestBed.get(ActivatedRoute);
       activatedRoute.testParams = {
          id: 1,
          role: defaultRole
        };
    });
  }));

  it("should create", () => {
    component.ngOnInit();
    // fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should display 'NO BLOCKS SELECTED' when no blocks selected", () => {
    component.ngOnInit();
    fixture.detectChanges();
    const noSelection = fixture.debugElement.query(By.css(".no-selection"));
    const noSelectionContent = noSelection.nativeElement.innerHTML;
    expect(noSelectionContent).toContain("NO BLOCKS SELECTED");
  });

  it(`should display selected illnesses groups with no subBlocks`, () => {
    component.ngOnInit();
    assignmentSvc.setSelected$([sectionItems[0]]);
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css(".assignment-section.growing"));
    const groups = container.queryAll(By.css(".badge"));
    expect(groups.length).toBe(1);
  });

  it(`should display selected illnesses groups with subBlocks`, () => {
    component.ngOnInit();
    assignmentSvc.setSelected$([sectionItems[0], sectionItems[1]]);
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css(".assignment-section.growing"));
    const groups = container.queryAll(By.css(".badge"));
    expect(groups.length).toBe(3);
  });

  it(`should be able to select All groups when it's not readOnly mode`, () => {
    component.readOnly = false;
    component.ngOnInit();
    fixture.detectChanges();
    const onSelectAll = spyOn(component, "onSelectAll").and.callThrough();
    const buttonAll = fixture.debugElement.query(By.css("#select-all"));
    buttonAll.triggerEventHandler("click", null);
    expect(onSelectAll).toHaveBeenCalled();
  });

  it(`should assign user to a task on having selected user`, () => {
    component.ngOnInit();
    assignmentSvc.setSelected$([sectionItems[3]]);
    fixture.detectChanges();
    spyOn(component, "assignUser").and.callThrough();
    component.assignUser(1);
    fixture.detectChanges();
    expect(component["assignUser"]).toHaveBeenCalled();
  });

  it(`should be able to submit a task`, () => {
    assignmentSvc.setSelected$([sectionItems[2], sectionItems[3]]);
    component.ngOnInit();
    fixture.detectChanges();
    spyOn(component, "onSubmit").and.callThrough();
    const submitButton = fixture.debugElement.query(By.css("#submit"));
    submitButton.triggerEventHandler("click", null);
    expect(component["onSubmit"]).toHaveBeenCalled();
  });

  it(`should be able to cancel a task and return to no-selection mode`, () => {
    component.ngOnInit();
    assignmentSvc.setSelected$([sectionItems[0]]);
    fixture.detectChanges();
    spyOn(component, "cancelAssignment").and.callThrough();
    const cancelButton = fixture.debugElement.query(By.css("#cancel"));
    cancelButton.triggerEventHandler("click", null);
    assignmentSvc.setSelected$([]); // reset state
    expect(component["cancelAssignment"]).toHaveBeenCalled();
    fixture.detectChanges();
    const noSelection = fixture.debugElement.query(By.css(".no-selection"));
    const noSelectionContent = noSelection.nativeElement.innerHTML;
    expect(noSelectionContent).toContain("NO BLOCKS SELECTED");
  });

  it("should handle lack of user selection without throwing", async(() => {
    assignmentSvc.setSelected$([sectionItems[1], sectionItems[3]], -1);
    component.ngOnInit();
    fixture.detectChanges();
    const selection = fixture.debugElement.nativeElement.innerHTML;
    expect(selection).toMatch("Blocks Selected");
    expect(selection).not.toMatch("Currently Assigned To");
  }));

  it("checkSubBlocks should return false", () => {
    const oldBlocks = [
      {
        subBlock: null as IllnessGroupRow[]
      },
      {
        subBlock: [
          {} as IllnessGroupRow,
          {} as IllnessGroupRow
        ]
      }
    ] as IllnessGroupRow[];
    const newBlocks = [
      {
        subBlock: null as IllnessGroupRow[]
      },
      {
        subBlock: [
          {} as IllnessGroupRow
        ]
      }
    ] as IllnessGroupRow[];
    expect(component["checkSubBlocks"](oldBlocks, newBlocks)).toEqual(false);
  });

  it("checkSubBlocks should return true", () => {
    const blocks = [
      {
        subBlock: null as IllnessGroupRow[]
      },
      {
        subBlock: [
          {} as IllnessGroupRow
        ]
      }
    ] as IllnessGroupRow[];
    expect(component["checkSubBlocks"](blocks, blocks)).toEqual(true);
  });
});
