/**
 * Created by sergeyyudintsev on 27.07.17.
 */
import {
  Component,
  OnDestroy,
  OnInit,
  Input, Output, EventEmitter
} from "@angular/core";

@Component({
  selector: "mita-illness-table",
  templateUrl: "./illness-table.component.html",
  styleUrls: ["./illness-table.component.sass"]
})

export class IllnessTableComponent implements OnInit, OnDestroy {
  @Input() illnesses: MITA.Illness.IllnessTracking[];
  @Input() selectedIllnessVersion: number;
  @Input() selectedIllnessICD: string;
  @Output() illnessSelected = new EventEmitter();

  constructor() {}

  ngOnInit() {
  }

  ngOnDestroy() {}


}
