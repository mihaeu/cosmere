import { ConfluenceAPI } from "../src/ConfluenceAPI";

describe("ConfluenceAPI", () => {
  it.skip("fails", () => {
    expect(new ConfluenceAPI("", "", "")).toBeFalsy();
  });
});