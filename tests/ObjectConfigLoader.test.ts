import { ObjectConfigLoader } from "../src/ObjectConfigLoader";

describe("ObjectConfigLoader", () => {
    const objectConfigurationWithPersonalAccessToken = {
        baseUrl: "https://confluence.custom.host/rest/api",
        personalAccessToken: "unbearable",
        prefix: "This document is automatically generated. Please don't edit it directly!",
        cachePath: "cache/",
        fileRoot: __dirname,
        pages: [
            {
                pageId: "123456789",
                file: "./tests/README.md",
            },
        ],
        insecure: false,
        force: false,
        cleanupLocalAttachmentFiles: false,
    };

    const objectConfigurationWithUserPass = {
        baseUrl: "https://confluence.custom.host/rest/api",
        user: "user",
        pass: "pass",
        prefix: "This document is automatically generated. Please don't edit it directly!",
        fileRoot: __dirname,
        cachePath: "cache/",
        pages: [
            {
                pageId: "123456789",
                file: "./tests/README.md",
            },
        ],
        insecure: false,
        force: false,
        cleanupLocalAttachmentFiles: false,
    };

    it("should create bearer token from personal access token", async () => {
        expect(await ObjectConfigLoader.load(objectConfigurationWithPersonalAccessToken)).toEqual({
            authorizationToken: "Bearer unbearable",
            configPath: __dirname,
            ...irrelevantConfigFields,
        });
    });

    it("should create base64 basic token from username and password", async () => {
        expect(await ObjectConfigLoader.load(objectConfigurationWithUserPass)).toEqual({
            authorizationToken: "Basic dXNlcjpwYXNz",
            configPath: __dirname,
            ...irrelevantConfigFields,
        });
    });

    const irrelevantConfigFields = {
        baseUrl: "https://confluence.custom.host/rest/api",
        cachePath: "cache/",
        pages: [
            {
                file: __dirname + "/README.md",
                pageId: "123456789",
            },
        ],
        prefix: "This document is automatically generated. Please don't edit it directly!",
        customRenderer: undefined,
        cleanupLocalAttachmentFiles: false,
    };
});
