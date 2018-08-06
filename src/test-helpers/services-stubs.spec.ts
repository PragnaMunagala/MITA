import {TestModalContentComponent} from "./components-stubs.spec";
import {
  ComponentFactory, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector,
  ReflectiveInjector
} from "@angular/core";
import {Observable, BehaviorSubject, Subject} from "rxjs";
import * as _ from "lodash";

const tasksFake = require("./test-data/tasks.json");
const illnessesFake = require("./test-data/illness.json");
const progressFake = require("./test-data/progress.json");
const userDataFake = require("./test-data/user.json");
import {assignmentState} from "../app/app.config";
import {Response, ResponseOptions} from "@angular/http";
import StateName = MITA.Illness.StateName;

@Injectable()
export class AuthServiceStub {
  auth0State: BehaviorSubject<MITA.User.Data | null> = new BehaviorSubject(null);

  logout() {
  }

  get apiToken(): Observable<MITA.Auth0.APIAccessToken> {
    return Observable.of({
      access_token: "token",
      token_type: "token",
      expires_in: 1000,
      scope: "string"
    });
  }

  createUser(user: MITA.Auth0.NewUser): Observable<MITA.Auth0.NewUserResponse> {
    return Observable.of({
      created_at: new Date().toISOString(),
      email: "test@test.com",
      email_verified: true,
      identities: {
        connection: "test",
        isSocial: false,
        provider: "advinow",
        user_id: "user"
      },
      picture: "user.jpeg",
      updated_at: new Date().toISOString(),
      user_id: "advinow",
      app_metadata: {
        name: "test",
        surname: "test",
        role: 1,
      }
    });
  }

  removeUser(email: string): Observable<any> {
    return Observable.empty();
  }

  /**
   * Testing methods
   */
  set testUser(role: MITA.RoleName) {
    const testUsers = {
      collector: <MITA.User.Data>{
        userId: 1,
        email: "test@test.com",
        name: "Test",
        surname: "Testing",
        roleId: 1,
        roleName: "collector",
        createdOn: new Date(),
        rating: 100
      }
    };
    this.auth0State.next(testUsers[role]);
  }
}

@Injectable()
export class IdleDetectorServiceStub {
  start() {
  }

  stop() {
  }
}

@Injectable()
export class UserServiceStub {
  private userCurrentAllSource = new BehaviorSubject(tasksFake.current["collectors"]);
  private userByRoleSource = new BehaviorSubject(userDataFake.rating); // this will be OK for collectors

  userCurrentAll$(role: MITA.RoleName) {
    return this.userCurrentAllSource.asObservable();
  }

  userByRoleRating$(role: MITA.RoleName) {
    return this.userByRoleSource.asObservable();
  }

  userHistory$(role: MITA.RoleName, id: number) {
    return new BehaviorSubject(tasksFake.history.allTask);
  }

  get userAllGroupedByRole(): Observable<MITA.User.Data[][]> {
    return Observable.of(userDataFake.allTupleRole);
  }

  userByRoleAllSelectable$(role: MITA.RoleName): Observable<MITA.User.Selectable[]> {
    return this.userCurrentAllSource
      .map(users => _.map(users, (user: MITA.User.Data) => {
        return {
          id: user.userId,
          text: user.name + " " + user.surname
        };
      }));
  }

  userData(email: string): Observable<MITA.User.Data> {
    return Observable.of({
      "userId": 3,
      "name": "Juan",
      "surname": "Jimenez",
      "email": "j.jimenez@gmail.com",
      "rating": 0,
      "createdOn": new Date(),
      "roleId": 1,
      "roleName": "Collector" as MITA.RoleName,
    });
  }

  /**
   * TEST METHODS
   */

  set _users(users) {
    this.userCurrentAllSource.next(users);
  }

  set _usersByRole(role) {
    this.userByRoleSource.next(role === "collector"
      ? userDataFake.rating
      : userDataFake[role]);
  }

  reset() {
    this.userByRoleSource.next(userDataFake.rating);
    this.userCurrentAllSource.next(tasksFake.current["collectors"]);
  }

  removeUser(userId: number): Observable<any> {
    return userId ? Observable.empty() : Observable.throw(new Response(new ResponseOptions({body: {message: "Some error"}})));
  }

  userByRoleAll$(role: MITA.RoleName): Observable<MITA.User.Data[]> {
    return Observable.of(role ? userDataFake[role] : userDataFake["all"]);
  }
}

@Injectable()
export class TaskServiceStub {
  resetTask(taskId: number): Observable<any> {
    return taskId ? Observable.of(true) : Observable.throw(new Error());
  }

  getTasks(page: number): Observable<any> {
    if (page === null) return Observable.throw("Error");
    return Observable.of(tasksFake.taskList[page] || {taskList: [], totalElements: 0});
  }
}

@Injectable()
export class IllnessServiceStub {
  getTracking(letter: string, page: number, page_size: number): Observable<any> {
    if (page === null) return Observable.of(null);
    return Observable.of(illnessesFake[page] || null);
  }

  getProgress(letter: string): Observable<any> {
    return Observable.of(progressFake.progressVOList[0]);
  }

  getInfo(): Observable<{ [id: string]: MITA.Illness.Info }> {
    return Observable.of({
      "A00.0v1": {
        icd10Code: "A00.0",
        name: "Cholera due to Vibrio cholerae 01, biovar cholerae",
        prior: 0,
        source: "MICA",
        state: "COMPLETE" as StateName,
        updatedDate: 1510088752251,
        version: 1
      } as MITA.Illness.Info
    });
  }

}

@Injectable()
export class NgbModalStub {
  constructor(private resolver: ComponentFactoryResolver) {
  }

  private createComponent(component: any): ComponentRef<any> {
    const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(component);
    const injector = ReflectiveInjector.fromResolvedProviders([]);
    return factory.create(injector);
  }

  open(component?: any): ComponentRef<any> {
    return this.createComponent(component || TestModalContentComponent);
  }
}

@Injectable()
export class AssignmentsServiceStub {
  private stateSource: BehaviorSubject<MITA.Assignments.state> = new BehaviorSubject(_.cloneDeep(assignmentState));
  state$ = this.stateSource.asObservable();

  private get state() {
    return this.stateSource.value;
  }

  resetFrom(view, role) {
  }

  setState(state) {
    this.stateSource.next(state);
  }

  initAssignmentView(role, view, id) {
  }

  selectGroup(group) {
  }

  selectGroupAll() {
  }

  viewBlock(view, item) {
  }

  assignUser(id) {
  }

  submitTask() {
    return Observable.of(true);
  }

  validateTask() {
    return true;
  }

  cancelAssignment() {
  }

  get items$(): Observable<MITA.Assignments.viewItem[]> {
    return this.state$
      .pluck("items")
      .distinctUntilChanged() as Observable<MITA.Assignments.viewItem[]>;
  }

  get selected$(): Observable<MITA.Assignments.AssignmentData> {
    return this.state$
      .pluck("selected");
  }

  get currentView$() {
    return this.state$
      .pluck("current")
      .distinctUntilChanged();
  }

  set currentView$(current: any) {
    const state = {
      ...this.cloneState,
      current
    };
    this.stateSource.next(state);
  }

  get userSelected$() {
    return this.state$.pluck("selected", "user") as Observable<number>;
  }


  private get cloneState(): MITA.Assignments.state {
    return _.cloneDeep(this.state);
  }

  /**
   * TEST METHODS
   */

  set _items$(items: MITA.Assignments.AssignmentItems) {
    const state = {
      ...this.cloneState,
      items
    };
    this.stateSource.next(state);
  }

  setSelected$(items: MITA.Assignments.SectionItem[], user?: number) {
    const state = {
      ...this.cloneState,
      selected: {
        user: user || 1,
        block: items
      }
    };
    this.stateSource.next(state);
  }
}

@Injectable()
export class ModalServiceStub {
  private _contentComponentRef: ComponentRef<any>;

  constructor(private _resolver: ComponentFactoryResolver,
              private _injector: Injector) {
  }

  private _createComponent(component: any): ComponentRef<any> {
    const factory: ComponentFactory<any> = this._resolver.resolveComponentFactory(component);
    const injector = ReflectiveInjector.fromResolvedProviders([]);
    return factory.create(injector);
  }

  public closeEvent: Subject<any> = new Subject();

  open(component): ComponentRef<any> {
    const contentRef = this._createComponent(component);
    const closeModal = (res: any): void => {
      this.close(res);
    };
    contentRef.instance.closeModal = closeModal;
    contentRef.instance.onModalClose = this.closeEvent;
    this._contentComponentRef = contentRef;
    return contentRef;

  }

  close(res: any) {
    this._contentComponentRef.instance.onModalClose.next(res);
  }
}
