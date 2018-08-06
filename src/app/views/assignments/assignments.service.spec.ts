/* tslint:disable:no-unused-variable */

import {
  inject,
  fakeAsync,
  tick,
  TestBed
} from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import {
  Http,
  ConnectionBackend,
  BaseRequestOptions,
  Response,
  ResponseOptions
} from "@angular/http";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { RouterNavigateStub } from "../../../test-helpers/router-stubs.spec";
import { AssignmentsService } from "./assignments.service";
import { assignmentState, config, APP_CONFIG } from "../../app.config";
const assignmentFake = require("../../../test-helpers/test-data/assignment.json");
const collectorItems = assignmentFake.collector.section;
const initState = () => _.cloneDeep(assignmentState);
const reduceSelectedGroupCount = (acc, group: MITA.Assignments.Assignable) => {
  if (group.notassigned === 0 || group.totalinblock === group.notassigned) {
    // all illnesses should be selected
    return acc + group.totalinblock;
  } else {
    return acc + group.totalinblock - group.notassigned;
  }
};

describe("AssignmentsService", () => {
  const topHiearchyItem = {
    "id": 5731,
    "block": "A00",
    "alreadyAssignedTo": [],
    "description": "Cholera",
    "subBlock": null,
    "totalinblock": 3,
    "notassigned": 2
  };
  const selectionSubBlock1 = {
    "id": 5732,
    "block": "A01",
    "alreadyAssignedTo": [],
    "description": "Typhoid and paratyphoid fevers",
    "subBlock": [
      {
        "parentGroupId": 5732,
        "alreadyAssignedTo": [],
        "block": "A01",
        "description": "[Non-grouped] Typhoid and paratyphoid fevers",
        "totalinblock": 4,
        "notassigned": 4,
        "notGrouped": true
      }
    ],
    "totalinblock": 11,
    "notassigned": 11
  };
  const selectionSubBlock2 = {
    "id": 5732,
    "block": "A01",
    "alreadyAssignedTo": [],
    "description": "Typhoid and paratyphoid fevers",
    "subBlock": [
      {
        "block": "A01.0",
        "alreadyAssignedTo": [],
        "description": "Typhoid fever",
        "child": null,
        "totalinblock": 7,
        "notassigned": 7,
        "idsubblock": 29761,
        "parentGroupId": 5732
      }
    ],
    "totalinblock": 11,
    "notassigned": 11
  };
  function assignmentItemsFake(backend: MockBackend, role: MITA.RoleName, view: MITA.Assignments.view) {
    backend.connections.subscribe(c => {
      const response = new ResponseOptions({body: assignmentFake[role]});
      c.mockRespond(new Response(response));
    });
  }

  function failOnData(err) {
    console.error("err: ", err);
    return fail("Data should not have been returned");
  }


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        AssignmentsService,
        { provide: APP_CONFIG, useValue: config },
        { provide: Router, useClass: RouterNavigateStub},
        { provide: Http,
          useFactory:
            (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
            deps: [MockBackend, BaseRequestOptions] }
        ]
    });
  });

  it("should create", inject([AssignmentsService], (service: AssignmentsService) => {
    expect(service).toBeTruthy();
  }));

  it("should initialise state",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const state = initState();
      return service.state$.subscribe(data => {
        expect(state).toEqual(data);
      });
    })
  );

  it("should expose user selection as observable",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const userID = 10;
      const initialUser = service["stateSource"].value.selected.user;
      expect(initialUser).toBe(-1);
      service.assignUser(userID);
      return service.userSelected$.subscribe(id => {
        expect(id).toEqual(userID);
      });
    })
  );

  it("should expose selection as observable and emit if different",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const userID = 10;
      let firstRun = true;
      service.selectGroupAll(collectorItems);
      service.selected$.subscribe(selected => {
        if (firstRun) expect(selected.block.length).toEqual(collectorItems.length);
        firstRun = false;
      });
      service.selectGroupAll(collectorItems);
      service.selected$.subscribe(selected => {
        expect(selected.block.length).toEqual(collectorItems.length * 2);
      });
    })
  );

  it("should initialise state and shortcircuit lack of items",
    inject([AssignmentsService, MockBackend], (service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const view: MITA.Assignments.view = "chapter";
      backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: null});
        c.mockRespond(new Response(response));
      });
      service.initAssignmentView(role, view);
      return service.items$.subscribe(data => {
        expect(data).toEqual([]);
      });
    })
  );

  it("should initialise state and load items of chapter view",
    inject([AssignmentsService, MockBackend], (service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const view: MITA.Assignments.view = "chapter";
      assignmentItemsFake(backend, role, view);
      service.initAssignmentView(role, view);
      return service.items$.subscribe(data => {
        expect(data[0]).toEqual(assignmentFake[role][view][0]);
      });
    })
  );

  it("should initialise state, load items of head view and rename chapters if appropriate",
    inject([AssignmentsService, MockBackend], (service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const view: MITA.Assignments.view = "head";
      const id = 2;
      assignmentItemsFake(backend, role, view);
      service.initAssignmentView(role, view, id);
      return service.items$.subscribe(data => {
        expect(data[0]).toEqual(assignmentFake[role][view][0]);
      });
    })
  );

  it("should output error when trying to get current view items returns Error",
    inject([AssignmentsService, MockBackend], (service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const view: MITA.Assignments.view = "chapter";
      backend.connections.subscribe(c => {
        c.mockRespond(new Error());
      });
      service.initAssignmentView(role, view);
      return service.items$.subscribe(null, data => {
        expect(data).toBe(Error);
      });
    })
  );

  it("should reinitialise state when role has changed",
    inject([AssignmentsService, MockBackend], fakeAsync((service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const newRole: MITA.RoleName = "reviewer";
      const view: MITA.Assignments.view = "chapter";
      const stub = backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: assignmentFake[role]});
        c.mockRespond(new Response(response));
      });
      service.initAssignmentView(role, view);
      const test = service.items$.subscribe(data => {
        expect(data[0]).toEqual(assignmentFake[role][view][0]);
      });
      tick();
      stub.unsubscribe();
      test.unsubscribe();
      assignmentItemsFake(backend, newRole, view);
      service.initAssignmentView(newRole, view);
      service.items$.subscribe(newData => {
        expect(newData[0]).toEqual(assignmentFake["reviewer"][view][0]);
      });
    }))
  );

  it("should allow navigation down the tree from chapter to head",
    inject([AssignmentsService, MockBackend, Router], fakeAsync((service: AssignmentsService, backend: MockBackend, router: Router) => {
      const role: MITA.RoleName = "collector";
      const view: MITA.Assignments.view = "chapter";
      const newView: MITA.Assignments.view = "head";
      let chapters;
      const stub = backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: assignmentFake[role]});
        c.mockRespond(new Response(response));
      });
      service.initAssignmentView(role, view);
      const test = service.items$.subscribe(data => {
        chapters = data;
        expect(data[0]).toEqual(assignmentFake[role]["chapter"][0]);
      });
      tick();
      stub.unsubscribe();
      test.unsubscribe();
      service.viewBlock(view, chapters[0]);
      tick();
      return service.currentView$.subscribe(data => {
        expect(data["chapter"]).toEqual(chapters[0]);
      });
    }))
  );

  it("should allow resetting state from chapter onwards",
    inject([AssignmentsService, MockBackend], fakeAsync((service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const view: MITA.Assignments.view = "chapter";
      let chapters;
      assignmentItemsFake(backend, role, view);
      service.initAssignmentView(role, view);
      const stub = backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: assignmentFake[role]});
        c.mockRespond(new Response(response));
      });
      const test = service.items$.subscribe(data => {
        chapters = data;
        expect(data[0]).toEqual(assignmentFake[role]["chapter"][0]);
      });
      tick();
      stub.unsubscribe();
      test.unsubscribe();
      assignmentItemsFake(backend, role, "head");
      service.viewBlock("head", chapters[0]);
      tick();
      service.resetFrom("chapter");
      service.state$.subscribe(state => {
        expect(state.items[view][0]).toEqual(assignmentFake[role]["chapter"][0]);
        expect(_.keys(state.current).length).toBe(0);
      });
    }))
  );

  it("should allow resetting state from head onwards",
    inject([AssignmentsService, MockBackend], fakeAsync((service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const view: MITA.Assignments.view = "chapter";
      let chapters;
      let head;
      const stub = backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: assignmentFake[role]});
        c.mockRespond(new Response(response));
      });
      service.initAssignmentView(role, view);
      let items = service.items$.subscribe(data => {
        chapters = data;
        expect(data[0]).toEqual(assignmentFake[role]["chapter"][0]);
      });
      tick();
      stub.unsubscribe();
      items.unsubscribe();
      assignmentItemsFake(backend, role, "head");
      service.viewBlock("chapter", chapters[0]);
      service.initAssignmentView(role, "head", 25);
      tick();
      items = service.items$.subscribe(data => {
        head = data;
        expect(data[0]).toEqual(assignmentFake[role]["head"][0]);
      });
      service.viewBlock("head", head[0]);
      service.resetFrom("head");
      service.state$.subscribe(state => {
        expect(state.items[view][0]).toEqual(assignmentFake[role]["chapter"][0]);
        expect(_.keys(state.current).length).toBe(1);
      });
    }))
  );

  it("should allow selecting all available groups",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroupAll(state.items.section);
      return service.selected$.subscribe(selected => {
        expect(selected.block).toEqual(state.items.section);
      });
    })
  );

  it("should allow cancelling selection",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role: role,
        view: "section"
      };
      service.selectGroupAll(state.items.section);
      service.cancelAssignment();
      return service.selected$.subscribe(selected => {
        expect(selected.block.length).toEqual(0);
      });
    })
  );

  it("should allow selecting one group for assignment",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroup(state.items.section[0]);
      return service.selected$.subscribe(selected => {
        expect(selected.block[0]).toEqual(state.items.section[0]);
        expect(selected.block.length).toEqual(1);
      });
    })
  );

  it("should allow selecting one group with subBlocks for assignment",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroup(state.items.section[6]);
      return service.selected$.subscribe(selected => {
        expect(selected.block[0]).toEqual(state.items.section[6]);
        expect(selected.block.length).toEqual(1);
      });
    })
  );


  it("should allow adding another subblock to current selection",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      const subBlock = state.items.section[6];
      const nonGrouped = {
        id: 174,
        block: "C06",
        alreadyAssignedTo: [],
        "description": "Malignant neoplasm of other and unspecified parts of mouth",
        "subBlock": [
          {"parentGroupId": 174,
           "block": "C06",
           "description": "[Non-grouped] Malignant neoplasm of other and unspecified parts of mouth",
           "totalinblock": 4,
           "notassigned": 4,
           "notGrouped": true}],
        "totalinblock": 6,
        "notassigned": 6};
      service.selectGroup(subBlock);
      service.selectGroup(nonGrouped);
      return service.selected$.subscribe(selected => {
        expect(selected.block.length).toEqual(1);
        expect(selected.block[0].subBlock.length).toEqual(2);
      });
    })
  );

  it("should detect a group with subBlocks has already been selected and unselect it",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroup(state.items.section[6]);
      const firstTest = service.selected$.subscribe(selected => {
        expect(selected.block[0]).toEqual(state.items.section[6]);
        expect(selected.block.length).toEqual(1);
      });
      firstTest.unsubscribe();
      service.selectGroup(state.items.section[6]);
      service.selected$.subscribe(selected => {
        expect(selected.block.length).toEqual(0);
      });
    })
  );

  it("should detect a group witout subBlocks has already been selected and unselect it",
    inject([AssignmentsService], fakeAsync((service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroup(state.items.section[0]);
      const firstTest = service.selected$.subscribe(selected => {
        expect(selected.block[0]).toEqual(state.items.section[0]);
        expect(selected.block.length).toEqual(1);
      });
      firstTest.unsubscribe();
      service.selectGroup(state.items.section[0]);
      tick();
      service.selected$.subscribe(selected => {
        expect(selected.block.length).toEqual(0);
      });
    }))
  );

  it("should detect a subBlock has already been selected and unselect only that subBlock leaving other subBlocks",
    inject([AssignmentsService], (service: AssignmentsService) => {
      service.selectGroup(topHiearchyItem); // a topHierarchy without children
      service.selectGroup(selectionSubBlock1); // an AssignableParent with only one subBlock
      service.selectGroup(selectionSubBlock2); // an AssignableParent with only one subBlock
      const firstTest = service.selected$.subscribe(selected => {
        expect(selected.block.length).toEqual(2);
        expect(selected.block[1].subBlock.length).toEqual(2);
      });
      firstTest.unsubscribe();
      service.selectGroup(selectionSubBlock2);
      service.selected$.subscribe(selected => {
        expect(selected.block.length).toEqual(2);
        expect(selected.block[1].subBlock.length).toEqual(1);
      });
    })
  );

  it("should allow assigning an user ID to current selection",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const role: MITA.RoleName = "collector";
      const user = 1;
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroupAll(state.items.section);
      service.assignUser(user);
      return service.selected$.subscribe(selected => {
        expect(selected.user).toBe(1);
      });
    })
  );

  it("should detect if a task is valid and ready to be submitted",
    inject([AssignmentsService, MockBackend], fakeAsync((service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const user = 1;
      backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: true});
        c.mockRespond(new Response(response));
      });
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroupAll(state.items.section);
      service.assignUser(1);
      const valid = service.validateTask();
      expect(valid).toBe(true);
    })
  ));

  it("should detect if a task is not valid and ready to be submitted",
    inject([AssignmentsService, MockBackend], fakeAsync((service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const user = 1;
      backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: true});
        c.mockRespond(new Response(response));
      });
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroupAll(state.items.section);
      // no user has been added should be false
      const valid = service.validateTask();
      expect(valid).toBe(false);
    })
  ));

  it("should submit a task",
    inject([AssignmentsService, MockBackend], fakeAsync((service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const user = 1;
      backend.connections.subscribe(c => {
        const response = new ResponseOptions({body: true});
        c.mockRespond(new Response(response));
      });
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroupAll(state.items.section);
      service.assignUser(user);
      const spy = spyOn(service, "initState");
      service.submitTask()
        .toPromise()
        .then();
      tick();
      expect(spy).toHaveBeenCalled();
    })
  ));

  it("should select all illnesses of subBlock if none have been assigned",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const selection = collectorItems.find(item => item.id === 168);
      service.selectGroup(selection);
      const selectedCount = _.reduce(service["stateSource"].value.selected.block, reduceSelectedGroupCount, 0);
      expect(selectedCount).toBe(selection.notassigned);
  }));

  it("should select only remaining illnesses of subBlock if some remain to be completed",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const selection = collectorItems.find(item => item.id === 178);
      service.selectGroup(selection);
      const selectedCount = _.reduce(service["stateSource"].value.selected.block, reduceSelectedGroupCount, 0);
      expect(selectedCount).toBe(selection.totalinblock - selection.notassigned);
  }));

  it("should select all illnesses of subBlock (v2+) if all have been completed already",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const selection = collectorItems.find(item => item.id === 169);
      service.selectGroup(selection);
      const selectedCount = _.reduce(service["stateSource"].value.selected.block, reduceSelectedGroupCount, 0);
      expect(selectedCount).toBe(selection.totalinblock);
  }));

  it("should discriminate between groups which have all/some/none remaining illnesses when selecting all blocks",
    inject([AssignmentsService], (service: AssignmentsService) => {
      const shouldSelectCount = _.reduce(collectorItems, reduceSelectedGroupCount, 0);
      service.selectGroupAll(collectorItems);
      const selectedCount = _.reduce(service["stateSource"].value.selected.block, reduceSelectedGroupCount, 0);
      expect(selectedCount).toBe(shouldSelectCount);
  }));

  it("should output errors when trying to submit a task returns Error",
    inject([AssignmentsService, MockBackend], (service: AssignmentsService, backend: MockBackend) => {
      const role: MITA.RoleName = "collector";
      const user = 1;
      backend.connections.subscribe(c => c.mockError({json: () => new Error("stubError")}));
      const state = {
        ...initState(),
        current: {
          chapter: assignmentFake[role]["chapter"][0],
          head: assignmentFake[role]["head"][0],
          section: assignmentFake[role]["section"][0]
        },
        items: {
          chapter: assignmentFake[role]["chapter"],
          head: assignmentFake[role]["head"],
          section: assignmentFake[role]["section"]
        },
        role,
        view: "section"
      };
      service.selectGroupAll(state.items.section);
      service.assignUser(user);
      service
        .submitTask()
        .toPromise()
        .then(failOnData)
        .catch(err => expect(err.json().message).toBe("stubError"));

    }
  ));

  it(`should throw if view hasn't been detected`,
    inject([AssignmentsService], fakeAsync((service: AssignmentsService) => {
      const init = () => service.initAssignmentView("collector", null);
      expect(init).toThrow(new Error("View not configured"));
    })));
});
