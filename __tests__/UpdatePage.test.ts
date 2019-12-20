import { updatePage } from "../src/UpdatePage";
import { ConfluenceAPI } from "../src/ConfluenceAPI";
import { Page } from "../src/types/Page";
import { Config } from "../src/types/Config";

describe("UpdatePage", () => {
  it("fails", () => {
    const pageData: Page = {
      pageId: "123456789",
      file: "/dev/null"
    };
    const config: Config = {
      baseUrl: "string",
      cachePath: "string",
      prefix: "string",
      pages: [],
      configPath: null,
    };
    expect(updatePage(new ConfluenceAPI("", "", ""), pageData, config, false)).toBeFalsy();
  });
});