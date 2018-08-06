/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { NavComponent } from "./nav.component";
import { navItems, NAV_ITEMS } from "../../../app.config";
import * as _ from 'lodash';

describe("NavComponent", () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [ NavComponent ],
        providers: [
          {provide: NAV_ITEMS, useValue: navItems},
        ],
        imports: [RouterTestingModule]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it("should display all main views in the navbar", () => {
    let rendered = fixture.debugElement.nativeElement;
    let navEls = rendered.querySelectorAll(".nav-link");
    expect(navItems.length).toBe(navEls.length);
    _.forEach(navEls, (element: Node, i) => {
      expect(element.textContent).toBe(navItems[i].name);
    });
  });

  it("should display Assignments children in the dropdown", () => {
    const rendered = fixture.debugElement.nativeElement;
    let assignmentItems = [];
    let children = rendered.querySelectorAll(".dropdown-item");
    _.forEach(navItems, item => {
      if (item.children) assignmentItems = assignmentItems.concat(item.children)
    });
    expect(assignmentItems.length).toBe(children.length);
    _.forEach(children, (element: Element, i) => {
      let text = element.getElementsByTagName("span");
      expect(text[0].textContent).toBe(assignmentItems[i].name);
    });
  });
});
