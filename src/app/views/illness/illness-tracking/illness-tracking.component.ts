/**
 * Created by sergeyyudintsev on 27.07.17.
 */
import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import * as _ from "lodash";

import { IllnessService } from '../../../services/illness.service';
import {config} from "../../../app.config";

@Component({
  selector: "mita-illness-tracking",
  templateUrl: "./illness-tracking.component.html",
  styleUrls: ["./illness-tracking.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class IllnessTrackingComponent implements OnInit, OnDestroy {

  currentData: MITA.Illness.IllnessTracking[] = [];
  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', "M", 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
  pageSizes: number[] = config.pagination.pageSizes;
  loadingCurrentData = false;
  page = 1;
  pageSize: number = this.pageSizes[0];
  totalElements: number;
  filterByICD: string = this.letters[0];
  selectedIllness: MITA.Illness.IllnessTracking;
  progress: MITA.Illness.Progress;
  private subs: Subscription[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private illnessService: IllnessService) {}

  ngOnInit() {
    const illnessesSub = this.getIlnesses();
    this.subs.push(illnessesSub);
  }

  getIlnesses(): Subscription {
    this.loadingCurrentData = true;
    return this.illnessService.getTracking(this.filterByICD, this.page, this.pageSize)
      .subscribe((res: MITA.Illness.TrackingResponse) => {
        if (res === null) {
          this.currentData = [];
          this.totalElements = 0;
        } else {
          this.currentData = res.trackingVOList;
          this.totalElements = res.totalElements;
        }
        this.loadingCurrentData = false;
        this.cd.markForCheck();
      }, err => {
        this.loadingCurrentData = false;
        this.currentData = [];
        this.totalElements = 0;
        this.cd.markForCheck();
        throw err;
      });
  }

  changePage(page: number) {
    this.page = page;
    this.getIlnesses();
    window.scrollTo(0, 0);
  }

  setPageSize(newSize: number) {
    if (this.pageSize != newSize) {
      this.pageSize = newSize;
      this.changePage(1);
    }
  }

  setLetter(letter: string) {
    if (this.filterByICD != letter) {
      this.filterByICD = letter;
      this.changePage(1);
    }
  }

  selectIllness(illnessIdx: number) {
    const illness = this.currentData[illnessIdx];
    if (!this.selectedIllness || illness.id_icd10_code !== this.selectedIllness.id_icd10_code || illness.version_number !== this.selectedIllness.version_number) {
      this.selectedIllness = illness;
      this.cd.markForCheck();
      this.getProgress();
    }
  }

  getProgress() {
    this.illnessService.getProgress(this.selectedIllness.id_icd10_code)
      .subscribe(progress => {
        this.progress = progress;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }
}
