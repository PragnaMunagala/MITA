import { Inject, Injectable } from "@angular/core";
import { Http } from "@angular/http";
import * as _ from "lodash";
import { Observable } from "rxjs";
import { APP_CONFIG } from "../../app.config";

@Injectable()
export class SummaryService {

  constructor(@Inject(APP_CONFIG) private config: MITA.config,
              private http: Http) { }

  get progressInfo$(): Observable<MITA.SummaryItem[]> {
    let rootApi = this.config.api;
    let url = _.join([rootApi.main, "summary"], "/");
    return this.http.get(url)
      .map(data => data.json())
      .pluck("summary")
      .catch(err => Observable.throw(err));
  }

}
