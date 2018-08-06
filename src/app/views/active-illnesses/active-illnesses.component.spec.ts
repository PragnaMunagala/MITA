import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ActiveIllnessesComponent } from "./active-illnesses.component";
import {RouterOutletStubComponent} from "../../../test-helpers/router-stubs.spec";

describe("ActiveIllnessesComponent", () => {
  let component: ActiveIllnessesComponent;
  let fixture: ComponentFixture<ActiveIllnessesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveIllnessesComponent,
      RouterOutletStubComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveIllnessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
