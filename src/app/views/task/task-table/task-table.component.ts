import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input, OnChanges
} from '@angular/core';

@Component({
  selector: 'mita-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskTableComponent implements OnInit, OnChanges {
  @Input() tasks: MITA.Task.FullData[];
  @Input() role: MITA.RoleName;
  selectedTaskIdx: number | null;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: any) {
    if (changes.role && changes.role.previousValue !== changes.role.currentValue) this.selectedTaskIdx = null;
  }

  selectTask(idx: number) {
    if (this.selectedTaskIdx === idx) {
      this.selectedTaskIdx = null;
    } else {
      this.selectedTaskIdx = idx;
    }
  }
}
