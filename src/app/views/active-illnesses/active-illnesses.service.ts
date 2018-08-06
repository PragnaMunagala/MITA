import {Inject, Injectable} from "@angular/core";
import {Headers, Http, RequestOptions} from "@angular/http";
import {APP_CONFIG} from "../../app.config";

@Injectable()
export class ActiveIllnessesService {

  constructor(@Inject(APP_CONFIG) private config: MITA.config, private http: Http) { }

  getIllnesses(page: number, size: number, search: string, searchType: string) {
    let url = "https://devservices.advinow.net:443" + this.config.api.illness.approved;
    let params = `?page=${page}&size=${size}&status=APPROVED`;
    if (search) {
      if (searchType === "ICD 10 Code")
        params += `&icd10Code=${search}`;
      else
        params += `&name=${search}`;
    }
    url += params;
    return this.http.get(url)
      .map(data => {
      return data.json();
    });
  }

  saveData(data: any) {
    const url = "https://devservices.advinow.net:443" + this.config.api.illness.saveDataFrame;
    const headers = new Headers({
      "Content-Type": "application/json"
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.post(url, data, options)
      .map(res => {
        return res.json();
    });
  }
}
