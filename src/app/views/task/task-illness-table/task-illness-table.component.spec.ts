import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskIllnessTableComponent } from './task-illness-table.component';

describe('TaskIllnessTableComponent', () => {
  let component: TaskIllnessTableComponent;
  let fixture: ComponentFixture<TaskIllnessTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskIllnessTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskIllnessTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
