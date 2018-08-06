import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Subscription } from "rxjs";
import { AssignmentsService } from "../assignments.service";

@Component({
  selector: "mita-illnessesgroup",
  templateUrl: "./illnessesgroup.component.html",
  styleUrls: ["./illnessesgroup.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessesGroupComponent implements OnInit, OnDestroy {
  rows: MITA.Assignments.IllnessGroupRow[];
  expanded = {
    row: -1,
    subBlockIndexes: [] as number[]
  };
  role: MITA.RoleName;
  title: string;
  private illnessBlocks: any;
  private items$: Subscription;
  private items: MITA.Assignments.SectionItem[];
  private viewState$: Subscription;
  private selected$: Subscription;
  private currentTree: MITA.Assignments.CurrentSelection;
  private selectedGroups: MITA.Assignments.SectionItem[];
  private view: MITA.Assignments.view = "section";

  constructor(private assignmentSvc: AssignmentsService,
              private cd: ChangeDetectorRef,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params["id"];
      this.role = params["role"];
      this.assignmentSvc.initAssignmentView(this.role, this.view, id);
    });
    this.selected$ = this.assignmentSvc.selected$.subscribe(selected => {
      this.selectedGroups = selected.block;
    });
    this.viewState$ = this.assignmentSvc.currentView$.subscribe((view: MITA.Assignments.CurrentSelection) => {
      this.title = <string>_.get(view, ["head", "description"]);
      this.currentTree = view;
    });
    this.items$ = this.assignmentSvc.items$.subscribe(items => {
      this.items = items as MITA.Assignments.SectionItem[];
      this.rows = this.toRows(items as MITA.Assignments.SectionItem[]);
      this.cd.markForCheck();
    });

  }

  ngOnDestroy() {
    // items may be subscribed yet when service detects
    //   there is no data to show section yet (i.e.: refresh)
    this.items$.unsubscribe();
    this.viewState$.unsubscribe();
    this.selected$.unsubscribe();
  }

  /**
   * Illness Blocks
   */

  private toRows(data: MITA.Assignments.SectionItem[]): any {
    return _.flatMap(data, b => this.flattenSectionItem(b));
  }

  /**
   *
   * Parser which returns either a row for those items with no subblocks
   * or an array with the parent row divided into one non-grouped item and all the subBlocks
   * @private
   * @param {MITA.Assignments.SectionItem} data
   * @returns {(MITA.Assignments.IllnessGroupRow | MITA.Assignments.IllnessGroupRow[])}
   *
   * @memberOf IllnessesGroupComponent
   */
  private flattenSectionItem(data: MITA.Assignments.SectionItem): MITA.Assignments.IllnessGroupRow | MITA.Assignments.IllnessGroupRow[] {
    const dataSubBlock = (<MITA.Assignments.AssignableParent>data).subBlock;
    if (!dataSubBlock) return data as MITA.Assignments.IllnessGroupRow;
    const parent = data as MITA.Assignments.AssignableParent;
    const subBlocks = _.map(dataSubBlock, s => ({
      ...s,
      parentGroupId: parent.id
    } as MITA.Assignments.IllnessGroupRow));
    const notGroupedIllnesses = this.createNotGroupedIllnesses(parent);
    const items = [parent, ...subBlocks] as MITA.Assignments.IllnessGroupRow[];
    if (notGroupedIllnesses.totalinblock) {
      // substitute the parent for a notGroupedIllness object
      items.splice(1, 0, notGroupedIllnesses);
    }
    return items;
  }

  /**
   * NonGroupedIllnesses are the illnesses with same code as a parent which has subBlocks
   * For example, A01 has illnesses in subBlock A01.0. However, there are still illnesses without a subgroup
   * This parser converts those ungrouped illnesses into a selectable block
   * @param parent
   */
  private createNotGroupedIllnesses(parent: MITA.Assignments.AssignableParent): MITA.Assignments.IllnessGroupRow {
    const rowDataSubBlock = parent.subBlock;
    const notassignedInSubBlocks = _.chain(rowDataSubBlock)
      .map(sb => sb.notassigned)
      .reduce((a, b) => a + b, 0)
      .value();
    const totalInSubBlocks = _.chain(rowDataSubBlock)
      .map(sb => sb.totalinblock)
      .reduce((a, b) => a + b, 0)
      .value();
    return {
      ..._.omit(parent, ["subBlock", "id"]),
      parentGroupId: parent.id,
      description: "[Non-grouped] " + parent.description,
      totalinblock: parent.totalinblock - totalInSubBlocks,
      notassigned: parent.notassigned - notassignedInSubBlocks,
      notGrouped: true
    } as MITA.Assignments.IllnessGroupRow;
  }

  selectBlock(row:  MITA.Assignments.Assignable, index: number, e: Event): void {
    const parentGroupId = (<MITA.Assignments.IllnessGroupRow>row).parentGroupId;
    if (parentGroupId) {
      // a subBlock has been selected
      const parent = _.clone(_.find(this.items, i => i.id === parentGroupId)) as MITA.Assignments.AssignableParent;
      parent.subBlock = [row]; // only one subBlock has been selected and that's what we send to service
      this.assignmentSvc.selectGroup(parent);
    } else {
      const match = _.find(this.items, i => i.block === row.block);
      if (match) this.assignmentSvc.selectGroup(match);
    }
  }

  selectBlockAll(): void {
    const [groups, blocks] = _.partition(this.rows, g => !g.idsubblock && !g.notGrouped);
    const selection = _.map(groups, g => {
      if (!(<MITA.Assignments.AssignableParent>g).subBlock) return g;
      return {
        ...g,
        subBlock: _.filter(blocks, b => b.parentGroupId === g.id)
      };
    });
    this.assignmentSvc.selectGroupAll(selection);
  }

  private isSelected(row: MITA.Assignments.Assignable | MITA.Assignments.SectionItem): Boolean {
    const rowSubBlock = (<MITA.Assignments.AssignableParent>row).subBlock;
    const isParent = !!rowSubBlock;
    const parentGroupId = (<MITA.Assignments.IllnessGroupRow>row).parentGroupId;

    if (isParent) {
      // check if it's selected
      return !!_.find(this.selectedGroups, sg => sg.id === row.id);
    }

    if (parentGroupId) {
      // traverse to check which subblocks are selected
      const parentSelected = <MITA.Assignments.AssignableParent>_.find(this.selectedGroups, sg => sg.id === parentGroupId);
      if (!parentSelected) return false;
      const selectedSubBlocks = parentSelected.subBlock;
      // Find if subblock is selected
      const subBlockSelected = _.find(selectedSubBlocks, sb => {
        return sb.block === row.block;
      });
      return !!subBlockSelected;
    }

    const isRowSelected = !!_.find(this.selectedGroups, g => g.block === row.block);
    return isRowSelected;
  }

  private expandRow(row:  MITA.Assignments.IllnessGroupRow, rowIndex: number, event: Event) {
    event.stopPropagation();
    const expanded = rowIndex === this.expanded.row;
    if (expanded) {
      this.expanded = {
        row: -1,
        subBlockIndexes: []
      };
      return;
    }

    // Find all the subBlock rows to show
    const rowToShow = this.rows[rowIndex];
    const rowToShowSubBlock = (<MITA.Assignments.AssignableParent>rowToShow).subBlock;
    let totalRowsToShow = rowToShowSubBlock.length;
    const notGroupedIllnessess = _.find(this.rows, r => {
      return r.parentGroupId === row.id && r.notGrouped;
    });
    if (notGroupedIllnessess) totalRowsToShow++;
    const subBlockIndexes: number[] = [];
    _.times(totalRowsToShow, n => subBlockIndexes.push(rowIndex + n + 1));

    // update this.expanded
    this.expanded = {
      row: rowIndex,
      subBlockIndexes: subBlockIndexes
    };
  }

  isSubgroupVisible(index: number): boolean {
    if (this.expanded.row === -1) return false;
    return !!~_.indexOf(this.expanded.subBlockIndexes, index);
  }

}
