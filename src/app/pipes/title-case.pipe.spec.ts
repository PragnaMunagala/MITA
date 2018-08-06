/* tslint:disable:no-unused-variable */

import { TestBed, async } from "@angular/core/testing";
import { TitleCasePipe } from "./title-case.pipe";

describe("TitleCasePipe", () => {
  it("create an instance", () => {
    let pipe = new TitleCasePipe();
    expect(pipe).toBeTruthy();
  });

  it(`should return empty string when there's no input`, async(() => {
    let pipe: any = new TitleCasePipe();
    let output = pipe.transform();
    expect(output).toMatch("");
  }));

  it(`should return "Title Case Sentence" for "title case sentence"`, async(() => {
    let pipe: any = new TitleCasePipe();
    let output = pipe.transform("title case sentence");
    expect(output).toMatch("Title Case Sentence");
  }));
});
