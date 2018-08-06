/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module MITA {
  interface NavItem {
    name: string;
    path: string;
    icon?: string;
    children?: NavItem[];
  }

  namespace Auth0 {
    type AppMetadata = Readonly<{
      name: string;
      surname: string;
      role: number;
    }>

    type NewUser = Readonly<{
      connection: "Username-Password-Authentication" | "MITA",
      email: string,
      password: string,
      app_metadata: AppMetadata
    }>

    type NewUserResponse = Readonly<{
      created_at: string;
      email: string;
      email_verified: boolean;
      identities: {
        connection: string;
        isSocial: boolean;
        provider: string;
        user_id: string;
      };
      picture: string;
      updated_at: string;
      user_id: string;
      app_metadata: AppMetadata
    }>

    type APIAccessTokenPayload = Readonly<{
      client_id: string,
      client_secret: string;
      audience: string;
      grant_type: string;
    }>

    type APIAccessToken = Readonly<{
      access_token: string;
      token_type: string;
      expires_in: number,
      scope: string;
    }>
  }

  namespace Payload {
    type NewUser = Readonly<{
      role: string;
      email: string;
      name: string;
      surname: string;
    }>
  }

  interface config {
    idleTime: number;
    navItems: NavItem[];
    topHierarchies: Assignments.view[];
    assignmentViews: Assignments.view[];
    roleNames: RoleName[];
    api: {
      main: string;
      user: {
        all: string;
        create: string;
        byEmail: string;
        collector: string;
        reviewer: string;
        remove: string;
        deactivate: string;
      },
      task: {
        reset: string;
        list: string;
      },
      illness: {
        tracking: string;
        progress: string;
        approved: string;
        saveDataFrame: string;
      },
      assignment: string;
      collector: string;
      reviewer: string;
    },
    micaApi: {
      main: string;
      illness: {
        info: string;
      }
    }
    auth: {
      clientID: string;
      domain: string;
      apiToken: {
        url: string;
        payload: Auth0.APIAccessTokenPayload;
      },
      user: {
        root: string;
      }
    },
    pagination: {
      pageSizes: number[];
    }
  }

  type RoleName = "reviewer" | "collector" | "administrator" | "";
  type IllnessStateInactive = "unassigned" | "unassigned from rejected" | "approved";
  type IllnessStateActive = "assigned" | "assigned-pending" | "assigned-review";

  interface Role {
    roleId: number;
    name: RoleName;
    description: string;
  }

  interface DataCollector {
    id: number;
    text: string;
    name: string;
    surname: string;
  }

  interface SummaryItem {
    id: number;
    block: string;
    description: string;
    totalinblock: number;
    notassigned: number;
    complete: number;
  }

  namespace User {
    interface Selectable {
      id: number;
      text: string;
      rating?: number;
    }

    interface Rating {
      userId: number;
      roleId: number;
      name: string;
      surname: string;
      rating: number;
    }

    interface Data {
      userId: number;
      roleId: number;
      roleName: RoleName;
      name: string;
      surname: string;
      email: string;
      createdOn: Date;
      rating: number
    }

    interface APIData {
      user_id: number,
      role_id: number,
      role_name: string,
      email: string,
      name: string,
      surname: string,
      created_on: number
    }

    interface APIDataAll {
      created_on: number;
      email: string;
      name: string;
      surname: string;
      rating: number;
      userId: number;
      role: Role;
    }

    interface CollectorCurrent {
      userId: number;
      taskId: number;
      name: string;
      quality: string;
      totalNumberOfIllnesses: number;
      dateOfLastAssignedTask: Date;
      percentageCompleted: number;
    }

    interface BasicInfo {
      user_id: number,
      name: string,
      surname: string,
      email: string
    }

    interface CollectorCurrentAPI {
      collectors: CollectorCurrent[];
    }

    interface ReviewerHistory {
      dateStart: Date;
      dateCompleted: Date;
      totalOriginalAssigned: number;
    }

    interface CollectorHistory extends ReviewerHistory {
      qualityScore: number;
      totalSkipped: number;
      totalRejected: number;
    }

    type State = Readonly<{
      collector: MITA.User.Data[],
      reviewer: MITA.User.Data[]
    }>
  }

  namespace Illness {

    type StateName = "PENDING" | "COMPLETE" | "READY-FOR-REVIEW" | "REJECTED" | "APPROVED" | "PROTECTED";

    interface Pagination {
      totalElements: number;
    }

    interface TrackingResponse extends Pagination {
      trackingVOList: IllnessTracking[];
    }

    interface ProgressResponse extends Pagination {
      progressVOList: Progress[];
    }

    interface IllnessTracking {
      tracking_state: State;
      id_icd10_code: string;
      created_on: string;
      version_number: number;
      taskId: number;
      userName: string;
      userSurname: string;
    }

    interface ProgressUser {
      idTask: number;
      user: Task.TaskUser;
      originalCount: number;
      dateAssigned: number;      ateCompleted: number;
      createdOn: number;
      updatedOn: number;
      totalSkipped: number;
      totalRejected: number;
    }

    interface Progress {
      task_collector?: ProgressUser;
      task_reviewer?: ProgressUser;
      id_icd10_code: string;
      progress_id: number;
    }

    interface State {
      state_id: number;
      state_name: string;
    }

    interface ShortData {
      idIcd10Code: string;
      version: number;
      name: string;
      state: StateName;
    }

    interface Info {
      name: string;
      icd10Code: string;
      prior: number;
      state: StateName;
      source: string;
      updatedDate: number;
      version: number;
    }
  }

  namespace Task {
    interface Response {
      taskList: FullData[];
      totalElements: number;
    }

    interface TaskUser {
      userId: number;
      email: string;
      created_on: number;
      rating: number;
      surname: string;
      role: Role;
      name: string;
    }

    interface FullData {
      totalSkipped?: number;
      totalRejected?: number;
      user: TaskUser;
      idTask: number;
      originalCount: number;
      dateAssigned: number;
      dateCompleted: number;
      illnessList: Illness.ShortData[];
      createdOn: number;
      updatedOn: number;
    }

  }

  namespace Assignments {
    type view = "chapter" | "head" | "section" | "";
    type viewItem = TopHierarchyItem | SectionItem;
    type SectionItem = TopHierarchyItem | AssignableParent;
    type Assignable = TopHierarchyItem | IllnessGroupRow;

    interface TopHierarchyItem {
      id?: number;
      block: string;
      description: string;
      totalinblock: number;
      notassigned: number;
      alreadyAssignedTo: number[];
    }

    interface AssignableParent extends TopHierarchyItem {
      subBlock: IllnessGroupRow[];
    }


    interface IllnessGroupRow extends TopHierarchyItem {
      idsubblock?: number;
      notGrouped?: boolean;
      parentGroupId?: number;
      parentGroupRowIndex?: number;
      subBlock?: IllnessGroupRow[]; // this property is only present in Data, not in flatten values in component's view
    }

    interface AssignmentItems {
      chapter?: TopHierarchyItem[];
      head?: TopHierarchyItem[];
      section?: SectionItem[];
    }


    interface CurrentSelection {
      chapter?: TopHierarchyItem;
      head?: TopHierarchyItem;
      section?: SectionItem;
    }

    interface AssignmentData{
      user: number;
      block: IllnessGroupRow[];
    }

    interface AssignmentPayload {
      section: AssignmentData;
    }

    type state = Readonly<{
      current: CurrentSelection; // selected traversed view
      items: AssignmentItems; // loaded data from API
      selected: AssignmentData; // selected items
      role: RoleName;
      view: view;
    }>
  }
}
