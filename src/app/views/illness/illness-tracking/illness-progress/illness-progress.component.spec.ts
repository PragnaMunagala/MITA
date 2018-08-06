import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { IllnessProgressComponent } from './illness-progress.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {IllnessService} from "../../../../services/illness.service";
import {IllnessServiceStub} from "../../../../../test-helpers/services-stubs.spec";
import {SimpleChange} from "@angular/core";
const progressFake = require("../../../../../test-helpers/test-data/progress.json");

describe('IllnessProgressComponent', () => {
  let component: IllnessProgressComponent;
  let fixture: ComponentFixture<IllnessProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IllnessProgressComponent ],
      imports: [
        NgbModule.forRoot()
      ],
      providers: [
        { provide: IllnessService, useClass: IllnessServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessProgressComponent);
    component = fixture.componentInstance;
    component.progress = null;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll page', () => {
    const ngAfterViewChecked = spyOn(component, 'ngAfterViewChecked').and.callFake(() => 1);
    const ngOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    component.ngOnChanges({
      progress: new SimpleChange(null, progressFake.progressVOList[0], false)
    });
    fixture.detectChanges();
    expect(component.isProgressChanged).toEqual(true);

    ngAfterViewChecked.and.callThrough();
    component.ngAfterViewChecked();
    fixture.detectChanges();
    expect(component.isProgressChanged).toEqual(false);
  });
});
