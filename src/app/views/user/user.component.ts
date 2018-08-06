import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import * as _ from "lodash";
import { UserService } from "../../services/user.service";
import { TaskService } from "../../services/task.service";

@Component({
  selector: "mita-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit, OnDestroy {
  userHistorySelected: MITA.User.Selectable | null;
  currentData: MITA.User.CollectorCurrent[] = [];
  role: MITA.RoleName;
  loadingCurrentData = true;
  historyItems: MITA.User.CollectorHistory[] = [];
  loadingHistory = false;
  users: MITA.User.Selectable[];
  private subs: Subscription[] = [];

  constructor(private route: ActivatedRoute,
              private cd: ChangeDetectorRef,
              private user: UserService,
              private task: TaskService) { }

  ngOnInit() {
    let snapshot = this.route.snapshot;
    const roleSubscription = this.route.params
      .pluck("role")
      .subscribe((role: MITA.RoleName) => {
        this.role = role;
        if (this.currentData.length) {
          // role has changed
          this.resetRole();
        }
        const currentDataSub = this.user
          .userCurrentAll$(this.role)
          .subscribe(current => {
            this.currentData = current;
            this.loadingCurrentData = false;
            this.cd.markForCheck();
          });
        const usersSub = this.user.userByRoleRating$(this.role)
          .map(users => {
            if (users && users.length && users[0].rating) {
              const users_ = <MITA.User.Rating[]>users;
              return _.map(users_, u => {
                return {
                  id: u.userId,
                  text: u.name + " " + u.surname,
                  rating: u.rating
                };
              });
            } else {
              return users as MITA.User.Selectable[];
            }
          })
          .subscribe((users: MITA.User.Selectable[]) => {
            this.users = users;
            this.cd.markForCheck();
          });
        this.subs.push(currentDataSub, usersSub);
      });
    this.subs.push(roleSubscription);
  }

  private showHistoryForRow(row: MITA.User.CollectorCurrent, e?: Event) {
    let userSelectable = _.find(this.users, u => u.id === row.userId);
    if (userSelectable) this.showHistory(userSelectable);
  }

  private showHistory(user: MITA.User.Selectable, e?: Event) {
    this.loadingHistory = true;
    this.historyItems = [];
    this.userHistorySelected = user;
    this.user.userHistory$(this.role, user.id)
      .first()
      .subscribe(history => {
        this.historyItems = history;
        this.loadingHistory = false;
        this.cd.markForCheck();
      });
  }

  private resetRole() {
    this.currentData = [];
    this.users = [];
    this.historyItems = [];
    this.userHistorySelected = null;
    this.loadingCurrentData = true;
    _.each(this.subs, s => s.unsubscribe());
    this.cd.markForCheck();
  }

  private resetTask(taskIdx: number) {
    const task = this.currentData[taskIdx];
    this.loadingCurrentData = true;
    this.task.resetTask(task && task.taskId)
      .subscribe(res => {
        this.currentData.splice(taskIdx, 1);
        this.loadingCurrentData = false;
        this.cd.markForCheck();
      }, err => {
        this.loadingCurrentData = false;
        this.cd.markForCheck();
        console.log(err);
      });
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

}
