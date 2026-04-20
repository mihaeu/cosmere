jest.mock("../src/api/ConfluenceAPI");

import * as os from "os";
import { updatePage } from "../src/UpdatePage";
import { ConfluenceAPI } from "../src/api/ConfluenceAPI";
import { Page } from "../src/types/Page";
import { Config } from "../src/types/Config";

describe("UpdatePage", () => {
    it("should fail because no title property is found in config", async () => {
        const pageData: Page = {
            pageId: "123456789",
            file: os.devNull,
        };
        const config: Config = {
            baseUrl: "string",
            cachePath: "build",
            prefix: "string",
            pages: [],
            configPath: "...",
            authorizationToken: "Bearer unbearable",
        };
        const confluenceApi = new ConfluenceAPI("", "Bearer unbearable", false);
        confluenceApi.getAttachments = jest.fn().mockResolvedValueOnce({
            results: [],
        });
        confluenceApi.currentPage = jest.fn().mockResolvedValueOnce({
            data: {
                body: {
                    storage: {
                        value: "",
                    },
                },
                version: {
                    number: 1,
                },
            },
        });
        await expect(updatePage(confluenceApi, pageData, config, false)).rejects.toThrow(
            "Missing title property in config and no title found in markdown.",
        );
    });

    it("should call custom renderer", async () => {
        const pageData: Page = {
            pageId: "123456789",
            file: os.devNull,
            title: "test title",
        };
        const customRendererFunction = jest.fn();
        const config: Config = {
            baseUrl: "string",
            cachePath: "build",
            prefix: "string",
            pages: [],
            configPath: "...",
            authorizationToken: "Bearer unbearable",
            customRenderer: customRendererFunction,
        };
        const confluenceApi = new ConfluenceAPI("", "Bearer unbearable", false);
        confluenceApi.getAttachments = jest.fn().mockResolvedValueOnce({
            results: [],
        });
        confluenceApi.currentPage = jest.fn().mockResolvedValueOnce({
            data: {
                body: {
                    storage: {
                        value: "",
                    },
                },
                version: {
                    number: 1,
                },
            },
        });
        await updatePage(confluenceApi, pageData, config, false);
        expect(customRendererFunction.mock.calls.length).toBe(1);
    });
});
