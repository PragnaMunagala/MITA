import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from "@angular/core";
import {ActiveIllnessesService} from "../active-illnesses.service";
import {pageSizes} from "../../../app.config";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: "MITA-illnesses",
  templateUrl: "./illnesses.component.html",
  styleUrls: ["./illnesses.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessesComponent implements OnInit {
  rows = [];
  selectedRows: any = [];
  pageSizes: number[] = pageSizes;
  pageSize: number = this.pageSizes[0];
  page = 1;
  illnessesData: Subscription;
  totalElements = 0;
  search = "";
  loading = true;
  searchTypes = ["ICD 10 Code", "Illness Name"];
  searchType = this.searchTypes[0];
  selected: boolean[] = [];
  dataSaved = false;

  constructor(private activeIllnesses: ActiveIllnessesService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.illnessesData = this.getIllnessesData();
  }

  setPageSize(size: number) {
    if (this.pageSize === size)
      return;
    this.pageSize = size;
    this.changePage(1);
  }

  setSearchType(type: string) {
    if (this.searchType === type)
      return;
    this.searchType = type;
    if (this.search) {
      if (this.rows)
        this.illnessesData.unsubscribe();
      this.illnessesData = this.getIllnessesData();
    }
  }

  searchInput(val: any) {
    this.search = val;
    if (this.rows)
      this.illnessesData.unsubscribe();
    this.illnessesData = this.getIllnessesData();
  }

  changePage(page: number) {
    this.page = page;
    if (this.rows) {
      this.illnessesData.unsubscribe();
      this.selected = [];
    }
    this.illnessesData = this.getIllnessesData();
    window.scrollTo(0, 0);
  }

  setData() {
    this.rows = [];
    this.totalElements = 0;
    this.selected = [];
    this.cd.detectChanges();
  }

  selectedRow(row: any, i: number) {
    this.selected[i] = !this.selected[i];
    if (this.selected[i]) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter((item: any) => {
        if (item.icd10Code !== row.icd10Code)
          return item;
        if (item.version !== row.version)
          return item;
      });
    }
  }

  getIllnessesData() {
    return this.activeIllnesses.getIllnesses(this.page, this.pageSize, this.search, this.searchType).subscribe(response => {
      this.loading = false;
      if (response.content) {
        this.rows = response.content;
        this.totalElements = response.totalElements;
        for (let i = 0 ; i < this.rows.length; i++)
          this.selected.push(false);
        this.cd.detectChanges();
      } else {
        this.setData();
      }
    }, error => {
      this.loading = false;
      this.setData();
      throw Error(error);
    });
  }

  saveDataFrame() {
    const data: any = {};
    for (const obj of this.selectedRows) {
      data[obj.icd10Code] = obj.version;
    }
    const saveData = {"icd10Codes": data};
    this.activeIllnesses.saveData(saveData).subscribe(response => {
      console.log(response);
      this.dataSaved = true;
      this.selected = [];
      this.selectedRows = [];
      this.cd.detectChanges();
      setTimeout(() => {
        this.dataSaved =  false;
        this.cd.detectChanges();
      }, 3000);
    }, error => {
      throw Error(error);
    });
  }

  cancelSave() {
    this.selectedRows = [];
    this.selected = this.selected.map((item: boolean) => !item);
  }
}
