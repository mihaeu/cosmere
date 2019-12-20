import { ConfigLoader } from "../src/ConfigLoader";

describe("ConfigLoader", () => {
  it("fails", () => {
    expect(new ConfigLoader()).toBeFalsy();
  });
});