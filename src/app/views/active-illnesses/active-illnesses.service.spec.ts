import { TestBed, inject } from "@angular/core/testing";

import { ActiveIllnessesService } from "./active-illnesses.service";

describe("ActiveIllnessesService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActiveIllnessesService]
    });
  });

  it("should be created", inject([ActiveIllnessesService], (service: ActiveIllnessesService) => {
    expect(service).toBeTruthy();
  }));
});
