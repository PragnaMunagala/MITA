import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {config} from "../../app.config";
import {TaskService} from "../../services/task.service";
import {UserService} from "../../services/user.service";
import * as _ from "lodash";
import {IllnessService} from "../../services/illness.service";

@Component({
  selector: "mita-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskComponent implements OnInit, OnDestroy {

  currentData: MITA.Task.FullData[] = [];
  pageSizes: number[] = config.pagination.pageSizes;
  loadingCurrentData = false;
  totalElements = 0;
  page = 1;
  pageSize: number = this.pageSizes[0];
  roleFilter: MITA.RoleName = "collector";
  userFilter = "";
  private subs: Subscription[] = [];

  get users$(): Observable<MITA.User.Data[]> {
    return this.userService.userByRoleAll$(this.roleFilter);
  }

  constructor(private tasksService: TaskService,
              private userService: UserService,
              private illnessService: IllnessService,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subs[0] = this.getTasks();
    // this.subs.push(this.getIllnessesInfo());
    this.cd.markForCheck();
  }

  getTasks() {
    this.loadingCurrentData = true;
    const sub = Observable
      .zip(
        this.tasksService.getTasks(this.page, this.pageSize, this.userFilter ? "" : this.roleFilter, this.userFilter),
        this.illnessService.getInfo(),
        this.appendStateToIllnesses);
    return sub.subscribe((res: MITA.Task.Response) => {
      this.currentData = res.taskList;
      this.totalElements = res.totalElements;
      this.loadingCurrentData = false;
      this.cd.markForCheck();
    }, err => {
      this.currentData = [];
      this.totalElements = 0;
      this.loadingCurrentData = false;
      this.cd.markForCheck();
      throw new Error(err.message);
    });
  }

  setRoleFilter(role: MITA.RoleName) {
    if (this.roleFilter !== role) {
      this.userFilter = "";
      this.roleFilter = role;
      this.changePage(1);
    }
  }

  changePage(page: number) {
    const tasksSub = this.subs[0];
    if (tasksSub) tasksSub.unsubscribe();
    this.page = page;
    this.subs[0] = this.getTasks();
    window.scrollTo(0, 0);
  }

  setPageSize(newSize: number) {
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.changePage(1);
    }
  }

  ngOnDestroy() {
    _.forEach(this.subs, s => s.unsubscribe());
  }

  appendStateToIllnesses(tasks: MITA.Task.Response, illnesses: { [id: string]: MITA.Illness.Info }): MITA.Task.Response  {
    _.forEach(tasks.taskList, task => {
      _.forEach(task.illnessList, illness => {
        const foundIllness = illnesses[`${illness.idIcd10Code}v${illness.version}`];
        if (foundIllness) illness.state = foundIllness.state;
      });
    });
    return tasks;
  }
}
