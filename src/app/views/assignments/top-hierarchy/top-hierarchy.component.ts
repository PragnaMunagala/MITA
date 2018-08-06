import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  OnDestroy
 } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Subscription } from "rxjs";
import { AssignmentsService } from "../assignments.service";
import { RomanizePipe } from "../../../pipes/romanize.pipe";

@Component({
  selector: "mita-assignment-top-hierarchy",
  templateUrl: "./top-hierarchy.component.html",
  styleUrls: ["./top-hierarchy.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopHierarchyComponent implements OnInit, OnDestroy {
  items: MITA.Assignments.TopHierarchyItem[];
  private items$: Subscription;
  private stateView: MITA.Assignments.state;
  private role: MITA.RoleName;
  private view: MITA.Assignments.view;
  private title: string;
  private subtitle: string;
  private chapterTitle = "ICD-10-CM Chapter List";
  private currentView$: Subscription;

  constructor(private state: AssignmentsService,
              private romanize: RomanizePipe,
              private route: ActivatedRoute,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.view = <MITA.Assignments.view>this.route.snapshot.url[1].path;
    this.route.params.subscribe(params => {
      const id = params["id"];
      this.role = params["role"];
      this.state.initAssignmentView(this.role, this.view, id);
    });
    this.currentView$ = this.state.currentView$.subscribe((view: MITA.Assignments.CurrentSelection) => {
      const chapterId = _.get(view, ["chapter", "id"]);
      const chapterDesc = <string>_.get(view, ["chapter", "description"]);
      this.title = chapterDesc ? "CHAPTER " + this.romanize.transform(chapterId) + ":" : this.chapterTitle;
      this.subtitle = chapterDesc;
      this.items$ = this.state.items$.subscribe(items => {
        this.items = items;
        this.cd.markForCheck();
      });
    });
  }

  ngOnDestroy() {
    this.currentView$.unsubscribe();
    this.items$.unsubscribe();
  }

  onNextHierarchyLevel(item: MITA.Assignments.TopHierarchyItem, e: Event) {
    e.preventDefault();
    this.state.viewBlock(this.view, item);
  }

  getHalfItems(items: MITA.Assignments.TopHierarchyItem[], side: "left" | "right"): MITA.Assignments.TopHierarchyItem[] {
    const half_point = Math.ceil(items.length / 2);
    if (side === "left") return _.slice(items, 0, half_point);
    return _.slice(items, half_point);
  }

}
