/**
 * Created by sergeyyudintsev on 27.07.17.
 */
import {Inject, Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import * as _ from "lodash";
import {APP_CONFIG} from "../app.config";

@Injectable()
export class IllnessService {
  constructor(@Inject(APP_CONFIG) private config: MITA.config,
              private http: Http) {
  }

  getTracking(letter: string, page: number, pageSize: number): Observable<MITA.Illness.TrackingResponse> {
    const url = _.join([this.config.api.main, this.config.api.illness.tracking, `?page=${page}&page_size=${pageSize}&filterByICD10code=${letter}`], "/");
    return this.http.get(url)
      .map(data => data.json())
      .catch(err => {
        const error = err.json ? err.json() : err;
        return Observable.throw(error);
      });
  }

  getProgress(letter: string): Observable<MITA.Illness.Progress> {
    const url = _.join([this.config.api.main, this.config.api.illness.progress, `?page=1&page_size=1&filterByICD10code=${letter}`], "/");
    return this.http.get(url)
      .map(data => data.json())
      .map(responseData => responseData.progressVOList[0] || null)
      .catch(err => {
        const error = err.json ? err.json() : err;
        return Observable.throw(error);
      });
  }

  getInfo(): Observable<{ [id: string]: MITA.Illness.Info }> {
    const url = _.join([this.config.micaApi.main, this.config.micaApi.illness.info, "?source=MICA"], "/");
    return this.http.get(url)
      .map(data => data.json())
      .map(users => {
        const illnessMap: { [id: string]: MITA.Illness.Info } = {};
        _.forEach(users, user => {
          _.forEach(user.illnesses, ill => {
            illnessMap[`${ill.icd10Code}v${ill.version}`] = ill;
          });
        });
        return illnessMap;
      });
  }
}
