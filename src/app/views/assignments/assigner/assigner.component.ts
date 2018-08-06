import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output,
  ChangeDetectionStrategy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { AssignmentsService } from "../assignments.service";
import { UserService } from "../../../services/user.service";

@Component({
  selector: "mita-assigner",
  templateUrl: "./assigner.component.html",
  styleUrls: ["./assigner.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignerComponent implements OnInit {
  @Input() readOnly = true;
  @Output() selectAll = new EventEmitter() as EventEmitter<boolean>;
  users: Observable<MITA.User.Selectable[]>;
  role: MITA.RoleName;
  showUserDropdown = true;
  assignedUserID = -1;
  selectedGroups: Observable<MITA.Assignments.IllnessGroupRow[]>;
  loading = false;

  constructor(private assignment: AssignmentsService,
              private route: ActivatedRoute,
              private cd: ChangeDetectorRef,
              private user: UserService) {}

  ngOnInit() {
    this.role = this.route.snapshot.params["role"];
    this.selectedGroups = this.assignment.selected$
      .pluck("block")
      .distinctUntilChanged((x: MITA.Assignments.IllnessGroupRow[], y: MITA.Assignments.IllnessGroupRow[]) => {
        return x.length === y.length
          && this.checkSubBlocks(x, y);
      }) as Observable<MITA.Assignments.IllnessGroupRow[]>;
    this.users = this.selectedGroups
      .switchMap(selectedGroups => this.user.userByRoleAllSelectable$(this.role)
        .map(allUsers => {
          const previouslyAssigned: Set<number> = _.reduce(selectedGroups, (acc, block) => {
            const assignedIDs = block.subBlock
              ? _.flatMap(_.map(block.subBlock, "alreadyAssignedTo")) as number[]
              : block.alreadyAssignedTo;
            _.each(assignedIDs, id => acc.add(id));
            return acc;
          }, new Set());
          return _.filter(allUsers, user => !previouslyAssigned.has(user.id));
        })
        // .do(u => console.log("u: ", u))
      );
    this.assignment.userSelected$
      .subscribe(id => {
        this.assignedUserID = id;
        this.showUserDropdown = !~id;
      });
  }

  assignUser(id: number): void {
    this.assignment.assignUser(+id);
  }

  get assignedUserText() {
    return this.assignment
      .userSelected$
      .switchMap(id => (
        this.user.userByRoleAllSelectable$(this.role)
          .map(users => _.find(users, {id}))
          .filter(u => !!u)
          .pluck("text") as Observable<string>
      ));
  }

  get totalAssigned(): Observable<number> {
    return this.selectedGroups
      .map(selectedGroups => _.reduce(selectedGroups, (a: number, b: MITA.Assignments.IllnessGroupRow) => {
        const subBlock = (<MITA.Assignments.AssignableParent>b).subBlock;
        if (subBlock) {
          return a + _.reduce(subBlock, (subA: number, subB: MITA.Assignments.IllnessGroupRow) => {
            return subA + (subB.notassigned || subB.totalinblock);
          }, 0);
        } else {
          return a + (b.notassigned || b.totalinblock);
        }
      }, 0));
  }

  get selectedBlockNames(): Observable<string[]> {
    return this.selectedGroups
      .map(selectedGroups => _.flatMap(_.map(selectedGroups, sg => {
        const subBlock = (<MITA.Assignments.AssignableParent>sg).subBlock;
        let res: any;
        if (subBlock) {
          res = _.map(subBlock, sb => sb.block);
        } else {
          res = sg.block;
        }
        return res;
      })));
  }

  onSelectAll(): void {
    this.selectAll.emit(true);
  }

  onSubmit(): void {
    this.loading = true;
    const subSub: Subscription = this.assignment.submitTask()
      .finally(() => {
        this.loading = false;
        this.cd.detectChanges();
        subSub.unsubscribe();
      })
      .subscribe();
  }

  private isReadyToSubmit(): Boolean {
    return this.assignment.validateTask();
  }

  private checkSubBlocks(a: MITA.Assignments.IllnessGroupRow[], b: MITA.Assignments.IllnessGroupRow[]): boolean {
    const getSubBlockCount = (illness: MITA.Assignments.IllnessGroupRow[]): Array<number> => {
      return illness.map(block => {
        const subBlock = block.subBlock;
        if (subBlock) {
          return subBlock.length;
        }
        return 0;
      });
    };
    const oldBlocks = getSubBlockCount(a);
    const newBlocks = getSubBlockCount(b);
    for (let i = 0; i < oldBlocks.length; i++) {
      const oldBlock = oldBlocks[i];
      const newBlock = newBlocks[i];
      if (oldBlock !== newBlock) {
        return false;
      }
    }
    return true;
  }

  cancelAssignment() {
    this.assignment.cancelAssignment();
  }

}
