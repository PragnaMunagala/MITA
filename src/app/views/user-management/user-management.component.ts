import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from "@angular/core";
import { UserService } from "../../services";
import { Subscription } from "rxjs";
import * as _ from "lodash";

@Component({
  selector: "mita-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit, OnDestroy {

  loadingData = true;
  collectors: MITA.User.Data[] = [];
  reviewers: MITA.User.Data[] = [];
  administrators: MITA.User.Data[] = [];
  private subs: Subscription[] = [];

  constructor(private user: UserService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    const userSub = this.user.userAllGroupedByRole.subscribe(users => {
      [this.collectors, this.reviewers, this.administrators] = users;
      this.loadingData = false;
      this.cd.markForCheck();
    });
    this.subs.push(userSub);
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  removeCollector(userIdx: number) {
    this.collectors.splice(userIdx, 1);
  }
  removeReviewer(userIdx: number) {
    this.reviewers.splice(userIdx, 1);
  }
  removeAdministrator(userIdx: number) {
    this.administrators.splice(userIdx, 1);
  }
}
