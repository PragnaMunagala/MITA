import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IllnessesComponent } from "./illnesses.component";

describe("IllnessesComponent", () => {
  let component: IllnessesComponent;
  let fixture: ComponentFixture<IllnessesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IllnessesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
