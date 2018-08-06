import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import * as _ from "lodash";
import { AssignmentsService } from "../assignments.service";
import { RomanizePipe } from "../../../pipes/romanize.pipe";
@Component({
  selector: "mita-assignment-breadcrumbs",
  templateUrl: "./breadcrumbs.component.html",
  styleUrls: ["./breadcrumbs.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent implements OnInit {
  role: MITA.RoleName;
  private chapterTitle = "Chapter List";
  private chapter: string;
  private chapterContents: string;
  private head: string;
  private headBlock: string;
  private headTooltip: string;

  constructor(private cd: ChangeDetectorRef,
              private romanize: RomanizePipe,
              private assignments: AssignmentsService) {}

  ngOnInit() {
    this.assignments.state$.subscribe(state => {
      this.role = <MITA.RoleName>state.role;
      this.chapter = <string>_.get(state, ["current", "chapter", "id"]);
      let chapterBlock = _.get(state, ["current", "chapter", "block"]);
      this.headBlock = <string>_.get(state, ["current", "head", "block"]);
      this.chapterContents = "Ch. " + this.romanize.transform(this.chapter) + " > "
        + chapterBlock;
      this.head = this.headBlock ? this.chapterContents : "";
      this.headTooltip = <string>_.get(state, ["current", "head", "description"]);
      this.cd.markForCheck();
    });
  }

  onNavigate(view: MITA.Assignments.view, e: Event) {
    e.preventDefault();
    this.assignments.resetFrom(view, this.role);
  }

  private get current(): string {
    let current: string;
    if (!this.chapter) {
      // chapter view as chapter not selected yet
      current = this.chapterTitle;
    } else {
      current = this.headBlock ? this.headBlock : this.chapterContents;
    }
    return current;
  }

}
