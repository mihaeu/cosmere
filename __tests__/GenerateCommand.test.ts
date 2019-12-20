import GenerateCommand from "../src/GenerateCommand";

describe("GenerateCommand", () => {
  it("fails", () => {
    expect(GenerateCommand(null)).toBeFalsy();
  });
});