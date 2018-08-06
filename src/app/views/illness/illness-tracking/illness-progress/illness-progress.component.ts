import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewChecked,
  OnChanges
} from '@angular/core';
import { IllnessService } from '../../../../services/illness.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'mita-illness-progress',
  templateUrl: './illness-progress.component.html',
  styleUrls: ['./illness-progress.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessProgressComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  @Input() progress: MITA.Illness.Progress;
  isProgressChanged: boolean = false;
  private subs: Subscription[] = [];
  constructor(private illnessService: IllnessService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnChanges(changes: any) {
    const currentValue = changes.progress.currentValue;
    const previousValue = changes.progress.previousValue;
    if ((currentValue && currentValue.id_icd10_code) != (previousValue && previousValue.id_icd10_code) || (currentValue && currentValue.version_number) != (previousValue && previousValue.version_number)) {
      this.isProgressChanged = true;
    }
  }

  ngAfterViewChecked() {
    if (this.isProgressChanged) {
      window.scrollTo(0, window.outerHeight * 1000);
      this.isProgressChanged = false;
    }
  }

  ngOnDestroy() {
  }

}
