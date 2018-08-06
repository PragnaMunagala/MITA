import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Headers, Http, RequestOptions } from "@angular/http";
import * as _ from "lodash";
import { BehaviorSubject, Observable } from "rxjs";
import { assignmentState, APP_CONFIG } from "../../app.config";

@Injectable()
export class AssignmentsService {
  // TODO: if pattern gets repeated consider adding immutable.js
  private stateSource = new BehaviorSubject<MITA.Assignments.state>(_.cloneDeep(assignmentState));
  public state$ = this.stateSource.asObservable();
  private get state() { return this.stateSource.value; }

  constructor(@Inject(APP_CONFIG) private config: MITA.config,
              private http: Http,
              private router: Router) {}

  /**
   * 1. GETTERS
   */
  get items$()  {
    return this.state$
      .pluck("items", this.state.view)
      .filter(items => !!items)
      .distinctUntilChanged() as Observable<MITA.Assignments.viewItem[]>;
  }

  get currentView$() {
    return this.state$
      .pluck("current")
      .distinctUntilChanged();
  }

  get selected$() {
    return this.state$
      .pluck("selected")
      .filter(selected => !!selected)
      .distinctUntilChanged((x, y) => _.isEqual(x, y)) as Observable<MITA.Assignments.AssignmentData>;
  }

  get userSelected$() {
    return this.state$.pluck("selected", "user") as Observable<number>;
  }

  /**
   * 2.NAVIGATION
   */

  /**
   *
   * Manage state and routing when navigation the tree of illnesses
   * It allows to navigate forwards and backwards whilst keeping assignment state intact
   * @param {MITA.Assignments.view} view
   * @param {MITA.Assignments.viewItem} item
   *
   * @memberOf AssignmentsService
   */
  viewBlock(view: MITA.Assignments.view, item: MITA.Assignments.viewItem) {
    const views = this.config.assignmentViews;
    const index = _.indexOf(views, view) + 1; // it will select chapter if view is incorrect
    const nextView = views[index];
    const state = {
      ...this.state,
      items: _.omit(this.state.items, nextView),
      current: {
        ...this.state.current,
        [this.state.view]: item
      }
    };
    this.stateSource.next(state);
    this.router.navigate(["assignments", this.state.role, nextView, item.id]);
  }


  /**
   * 3. STATE MANAGEMENT
   */

  /**
   *
   * Manage (re)initialisation of state based on role, view and items to display
   * @param {MITA.RoleName} role
   * @param {MITA.Assignments.view} view
   * @param {number} id
   *
   * @memberOf AssignmentsService
   */
  initAssignmentView(role: MITA.RoleName, view: MITA.Assignments.view, id?: number): void {
    // reset state if there's a change of role
    if (this.state.role && this.state.role !== role) {
      this.initState();
    }

    // Update state
    const state = {
      ...this.state,
      role,
      view
    };

    // safe guard in case method is called from a different view to chapter
    if ((state.view === "head" || state.view === "section") && !state.current.chapter) {
      this.router.navigate(["assignments"]);
      return;
    }
    // Publish new values
    this.stateSource.next(state);
    // First view is not selected
    // Fetch now
    this.loadItems(id);
  }

  /**
   *
   * Reset state from a given view forward (for breadcrumbs)
   * @param {MITA.Assignments.view} view
   * @param {MITA.RoleName} [forRole]
   *
   * @memberOf AssignmentsService
   */
  resetFrom(view: MITA.Assignments.view, forRole?: MITA.RoleName) {
    const state = _.cloneDeep(this.state);
    const role = forRole || state.role;
    const path = ["assignments", role, view];
    let id: number | undefined;

    // Always delete the section
    delete state.current.section;

    if (view === "chapter") {
      // Delete Selected Items
      delete state.current.chapter;
      delete state.current.head;
      // Delete loaded API data
      delete state.items.head;
      delete state.items.section;
    }
    if (view === "head" && state.current.chapter && state.current.chapter.id) {
      id = state.current.chapter.id;
      delete state.current.head;
      delete state.items.section;
    }
    if (id && view === "head") path.push(id.toString());
    this.stateSource.next(state);
    this.router.navigate(path);
  }

  initState(): void {
    this.stateSource.next(_.cloneDeep(assignmentState));
  }


  /**
   * 4. ASSIGNMENT OF TASKS
   */

  selectGroup(group: MITA.Assignments.SectionItem): void {
    const selectedBlocks = _.cloneDeep(this.state.selected.block);
    const selectedGroupIndex = _.findIndex(selectedBlocks, sb => sb.block === group.block);
    const assignableChild = (<MITA.Assignments.AssignableParent>group).subBlock;

    if (~selectedGroupIndex && !assignableChild) {
      selectedBlocks.splice(selectedGroupIndex, 1);
    } else if (assignableChild) {
      // It's a parent group
      const parentIndex = _.findIndex(selectedBlocks, sb => sb.block === group.block);
      const selectedSubBlocks = selectedBlocks[parentIndex]
        ? (<MITA.Assignments.AssignableParent>selectedBlocks[parentIndex]).subBlock
        : undefined;

      if (~parentIndex && selectedSubBlocks) {
        // parent subblocks had already been selected
        const subBlockSelectedIndex = _.findIndex(selectedSubBlocks, sb => sb.block === assignableChild[0].block);
        if (~subBlockSelectedIndex) {
          if (selectedSubBlocks.length === 1) {
            selectedBlocks.splice(parentIndex, 1);
          } else {
            selectedSubBlocks.splice(subBlockSelectedIndex, 1);
          }
        } else {
          selectedSubBlocks.push(assignableChild[0]);
        }
      } else {
        // first time parent is selected
        selectedBlocks.push(group);
      }
    } else {
      // it's either a group without subBlock
      // or a parent that has been fully selected (subBlock array should be empty)
      // or ungrouped illnessess within parent (notGrouped)
      selectedBlocks.push(group);
    }

    const state = {
      ...this.state,
      selected: {
        user: -1, // on clicking a new group user should be none again
        block: selectedBlocks
      }
    };
    this.stateSource.next(state);
  }

  selectGroupAll(groups: MITA.Assignments.IllnessGroupRow[]): void {
    const selectedBlocks = _.clone(this.state.selected.block);
    selectedBlocks.push(...groups);
    const state = {
      ...this.state,
      selected: {
        ...this.state.selected,
        block: selectedBlocks
      }
    };
    this.stateSource.next(state);
  }

  cancelAssignment(): void {
    const state = {
      ...this.state,
      selected: {
        user: -1,
        block: []
      }
    };
    this.stateSource.next(state);
  }

  assignUser(user: number): void {
    const state = {
      ...this.state,
      selected: {
        ...this.state.selected,
        user
      }
    };
    this.stateSource.next(state);
  }

  /**
   *
   * Detect if form is valid and/or ready to be submitted
   * @returns {Boolean}
   *
   * @memberOf AssignmentsService
   */
  validateTask(): Boolean {
    const state = this.state;
    if (!state.selected.user || state.selected.user === -1 || state.selected.block.length === 0) return false;
    return true;
  }



  /**
   * 5. HTTP
   */

  submitTask(): Observable<boolean> {
    const state = this.state;

    state.selected.block = _.map(state.selected.block, b => {
      const parent = _.omit(b, "alreadyAssignedTo") as MITA.Assignments.Assignable;
      const subBlock = (<MITA.Assignments.AssignableParent>parent).subBlock;
      if (subBlock && subBlock.length) {
        (<MITA.Assignments.AssignableParent>parent).subBlock = _.map(subBlock, sb => (
          _.omit(sb, "parentGroupId", "alreadyAssignedTo") as MITA.Assignments.IllnessGroupRow
        ));
      }
      return parent;
    });

    const payload: MITA.Assignments.AssignmentPayload = {
      section: state.selected
    };
    const headers = new Headers({
      "Content-Type": "application/json"
    });
    const options = new RequestOptions({
      headers: headers
    });
    const url = _.join([this.config.api.main,
                      this.config.api.assignment,
                      state.role], "/");

    return this.http.post(url, payload, options)
      .map(data => data.json())
      .map(response => {
        const role = state.role;
        this.initState();
        this.router.navigate(["assignments", role, this.config.assignmentViews[0]]);
        return true;
      });
  }

  /**
   *
   * Fetch items for the current view
   * @private
   * @param {number} [id]
   * @returns {Promise<MITA.Assignments.AssignmentItems>}
   *
   * @memberOf AssignmentsService
   */
  private loadItems(id?: number) {
    const state = this.state;
    if (!state.view) throw new Error("View not configured");
    const view = state.view;
    const idParameter = id ? id + "/" : "";
    let url = _.join([this.config.api.main,
                      this.config.api.assignment,
                      state.view,
                      idParameter], "/");
    url += state.role;
    return this.http.get(url)
      .map(data => data.json())
      .toPromise()
      .then((items: MITA.Assignments.AssignmentItems) => {
        const viewItems = (view && items && items[view] ? <MITA.Assignments.SectionItem[]>items[view] : []) as MITA.Assignments.SectionItem[];
        state.items[view] = viewItems;
        this.stateSource.next(state);
        return viewItems;
      })
      .catch(err => Observable.throw(err)) as Promise<MITA.Assignments.AssignmentItems>;
  }

}
