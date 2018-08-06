import { RomanizePipe } from "./romanize.pipe";

describe("RomanizePipe", () => {
  const pipe = new RomanizePipe();

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it(`should return empty string when there's no input`, () => {
    let output = (<any>pipe).transform();
    expect(output).toMatch("");
  });

  it(`should return empty string when input can't be divided into digits`, () => {
    let output = pipe.transform("");
    expect(output).toMatch("");
  });

  it(`should return "IX" for 9`, () => {
    let output = pipe.transform(9);
    expect(output).toMatch("IX");
  });

  it(`should return "XVIII" for 18`, () => {
    let output = pipe.transform(18);
    expect(output).toMatch("XVIII");
  });
});
