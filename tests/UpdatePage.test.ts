import { updatePage } from "../src/UpdatePage";
import { ConfluenceAPI } from "../src/api/ConfluenceAPI";
import { Page } from "../src/types/Page";
import { Config } from "../src/types/Config";

describe("UpdatePage", () => {
    it.skip("fails", () => {
        const pageData: Page = {
            pageId: "123456789",
            file: "/dev/null",
        };
        const config: Config = {
            baseUrl: "string",
            cachePath: "string",
            prefix: "string",
            pages: [],
            configPath: "...",
            authorizationToken: "Bearer unbearable",
        };
        expect(updatePage(new ConfluenceAPI("", "Bearer unbearable"), pageData, config, false)).toBeFalsy();
    });
});
