jest.mock('../src/api/ConfluenceAPI');

import { updatePage } from "../src/UpdatePage";
import { ConfluenceAPI } from "../src/api/ConfluenceAPI";
import { Page } from "../src/types/Page";
import { Config } from "../src/types/Config";

describe("UpdatePage", () => {
    it("should fail because no title property is found in config", async () => {
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
        const confluenceApi = new ConfluenceAPI("", "Bearer unbearable", false);
        confluenceApi.getAttachments = jest.fn().mockResolvedValueOnce({
            results: []
        })
        confluenceApi.currentPage = jest.fn().mockResolvedValueOnce({
            data: {
                body:{
                    storage:{
                        value: ''
                    }
                },
                version: {
                    number: 1
                }
            }
        })
        await expect(updatePage(confluenceApi, pageData, config, false)).rejects
            .toThrow("Missing title property in config and no title found in markdown.");
    });

    it("should call custom renderer", async () => {
        const pageData: Page = {
            pageId: "123456789",
            file: "/dev/null",
            title: 'test title',
        };
        const customRendererFunction = jest.fn();
        const config: Config = {
            baseUrl: "string",
            cachePath: "string",
            prefix: "string",
            pages: [],
            configPath: "...",
            authorizationToken: "Bearer unbearable",
            customRenderer: customRendererFunction,
        };
        const confluenceApi = new ConfluenceAPI("", "Bearer unbearable", false);
        confluenceApi.getAttachments = jest.fn().mockResolvedValueOnce({
            results: []
        })
        confluenceApi.currentPage = jest.fn().mockResolvedValueOnce({
            data: {
                body:{
                    storage:{
                        value: ''
                    }
                },
                version: {
                    number: 1
                }
            }
        })
        await updatePage(confluenceApi, pageData, config, false);
        expect(customRendererFunction.mock.calls.length).toBe(1);
    });

});
