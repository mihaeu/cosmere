import { updatePage } from "../src/UpdatePage";
import { ConfluenceAPI } from "../src/api/ConfluenceAPI";
import { Page } from "../src/types/Page";
import { Config } from "../src/types/Config";

describe("UpdatePage", () => {
  it.skip("fails", () => {
    const pageData: Page = {
      pageId: "123456789",
      file: "/dev/null"
    };
    const config: Config = {
      user: "",
      pass: "",
      baseUrl: "string",
      cachePath: "string",
      prefix: "string",
      pages: [],
      configPath: null,
    };
    expect(updatePage(new ConfluenceAPI("", config), pageData, config, false)).toBeFalsy();
  });
});