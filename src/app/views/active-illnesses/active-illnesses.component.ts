import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'MITA-active-illnesses',
  templateUrl: './active-illnesses.component.html',
  styleUrls: ['./active-illnesses.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveIllnessesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
