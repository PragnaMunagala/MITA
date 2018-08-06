import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskTableComponent } from './task-table.component';
import {FormsModule} from "@angular/forms";
import {TaskIllnessTableComponent} from "../task-illness-table/task-illness-table.component";
const fakeTasks = require('../../../../test-helpers/test-data/tasks.json');

describe('TaskTableComponent', () => {
  let component: TaskTableComponent;
  let fixture: ComponentFixture<TaskTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskTableComponent, TaskIllnessTableComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTableComponent);
    component = fixture.componentInstance;
    component.tasks = fakeTasks.taskList['1'].taskList;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should select task', () => {
    component.selectTask(1);
    expect(component.selectedTaskIdx).toEqual(1);
    component.selectTask(1);
    expect(component.selectedTaskIdx).toEqual(null);
  });
});
