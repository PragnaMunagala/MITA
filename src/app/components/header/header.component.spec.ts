/* tslint:disable:no-unused-variable */
import { Component } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";

import { HeaderComponent } from "./index";

@Component({
  selector: "MITA-nav",
  template: "<nav></nav>",
})
class NavComponentStub {}

@Component({selector: "mita-header-user", template: ""})
class HeaderUserStub {}

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        NavComponentStub,
        HeaderUserStub
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create header", () => {
    expect(component).toBeTruthy();
  });

  it("should render <nav> from child", () => {
    let rendered = fixture.debugElement.nativeElement;
    let nav = rendered.querySelector("nav");
    expect(nav).toBeTruthy();
  });
});
