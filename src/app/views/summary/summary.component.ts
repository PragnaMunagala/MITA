import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { Subscription } from "rxjs";
import * as _ from "lodash";
import { SummaryService } from "./summary.service";

@Component({
  selector: "mita-summary",
  templateUrl: "./summary.component.html",
  styleUrls: ["./summary.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryComponent implements OnInit {
  private progress$: Subscription;
  progressData: MITA.SummaryItem[];


  constructor(private summary: SummaryService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.progress$ = this.summary.progressInfo$.subscribe(s => {
      this.progressData = s;
      this.cd.markForCheck();
    });
  }

  private assigned(item: MITA.SummaryItem): number {
    return item.totalinblock - item.notassigned;
  }

  private completedPercent(item: MITA.SummaryItem): number {
    return item.complete * 100 / item.totalinblock;
  }

  private get total(): number {
    return _.reduce(this.progressData, (a: number, b: MITA.SummaryItem) => {
      return a + b.totalinblock;
    }, 0);
  }

  private get totalAssigned(): number {
    return _.reduce(this.progressData, (a: number, b: MITA.SummaryItem) => {
      return a + (b.totalinblock - b.notassigned);
    }, 0);
  }

  private get totalCompleted(): number {
    return _.reduce(this.progressData, (a: number, b: MITA.SummaryItem) => {
      return a + (b.complete);
    }, 0);
  }

  private get totalCompletedPercent(): number {
    return this.totalCompleted * 100 / this.total;
  }

}
