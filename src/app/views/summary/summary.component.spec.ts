/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";

import { BehaviorSubject } from "rxjs";
import { SummaryComponent } from "./summary.component";
import { SummaryService } from "./summary.service";
import { RomanizePipe } from "../../pipes/romanize.pipe";
const summaryFake = require("../../../test-helpers/test-data/summary.json").summary;

describe("SummaryComponent", () => {
  let component: SummaryComponent;
  let fixture: ComponentFixture<SummaryComponent>;

  class SummaryServiceStub {
    progressInfo$;

    constructor() {
      this.progressInfo$ = new BehaviorSubject(summaryFake);
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryComponent, RomanizePipe ],
      providers: [
        {provide: SummaryService, useClass: SummaryServiceStub}
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

});
