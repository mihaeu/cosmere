import MainCommand from "../src/MainCommand";

describe("MainCommand", () => {
  it("fails", () => {
    expect(MainCommand("")).toBeFalsy();
  });
});