/**
 * Created by sergeyyudintsev on 20.07.17.
 */
import { Inject, Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs";
import * as _ from "lodash";
import { APP_CONFIG } from "../app.config";

@Injectable()
export class TaskService {
  private cachedData: any = {
    collector: {
      taskList: {},
      totalElements: 0
    },
    reviewer: {
      taskList: {},
      totalElements: 0
    }
  };
  constructor(@Inject(APP_CONFIG) private config: MITA.config,
              private http: Http) { }

  resetTask(taskId: number): Observable<any> {
    const url = _.join([this.config.api.main, this.config.api.task.reset], "/");
    return this.http.post(url, {taskId: taskId})
      .map(data => data.json())
      .catch(err => Observable.throw(err.json()));
  }

  getTasks(page: number, pageSize: number, role?: MITA.RoleName, user?: string): Observable<MITA.Task.Response> {
    const filterByRole = role ? `filterByRole=${role}` : ``;
    const filterByUser = user ? `&filterByUser=${user}` : ``;
    const url = _.join([this.config.api.main, this.config.api.task.list, `?${filterByRole}${filterByUser}&page=${page}&page_size=${pageSize}`], "/");
    const defaultResponse: MITA.Task.Response = {
      taskList: [],
      totalElements: 0
    };
    const getData = (): Observable<MITA.Task.Response> => {
      if (role) {
        const cachedData = this.cachedData[role];
        const cachedTaskList = cachedData.taskList;
        const cachedTotalElements = cachedData.totalElements;
        const firstItemIdx = (page - 1) * pageSize + 1;
        const lastItemIdx = page * pageSize > this.cachedData[role].totalElements ? this.cachedData[role].totalElements : page * pageSize;
        const loaded = cachedTaskList[firstItemIdx] && cachedTaskList[lastItemIdx];
        const getDataFromServer = (): Observable<MITA.Task.Response> => {
          return this.http.get(url)
            .map(data => {
              return data.json();
            })
            .filter(data => {
              let changed = false;
              data.taskList.forEach((task: MITA.Task.FullData, idx: number) => {
                const listIdx = idx + firstItemIdx;
                const cachedTask = cachedTaskList[listIdx];
                if (cachedTask) {
                  changed = changed || task.idTask !== cachedTask.idTask;
                } else {
                  changed = true;
                }
                this.cachedData[role].taskList[listIdx] = task;
              });

              this.cachedData[role].totalElements = data.totalElements;
              return changed;
            });
        };

        for (let i = (firstItemIdx); i <= lastItemIdx; ++i) {
          const cachedTask = cachedTaskList[i];
          if (cachedTask) defaultResponse.taskList.push(cachedTask);
        }
        defaultResponse.totalElements = defaultResponse.taskList.length ? cachedTotalElements : 0;

        if (loaded && defaultResponse.totalElements) {
          return Observable.merge(
            Observable.of(defaultResponse),
            getDataFromServer()
          );
        } else {
          return getDataFromServer();
        }
      } else {
        return this.http.get(url)
          .map(data => {
            return data.json();
          });
      }
    };

    return getData()
      .catch(err => Observable.throw(err.json ? err.json() : err));
  }
}
