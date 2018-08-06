import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';

@Component({
  selector: 'MITA-task-illness-table',
  templateUrl: './task-illness-table.component.html',
  styleUrls: ['./task-illness-table.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskIllnessTableComponent implements OnInit {
  @Input() illnesses: MITA.Illness.ShortData[];

  constructor() { }

  ngOnInit() {
  }

}
