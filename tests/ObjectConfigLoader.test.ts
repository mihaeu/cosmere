import { ObjectConfigLoader } from "../src/ObjectConfigLoader";
import { ObjectConfig } from "../src/types/ObjectConfig";
import { BaseConfig } from "../src/types/BaseConfig";

describe("ObjectConfigLoader", () => {
    const objectConfigurationWithPersonalAccessToken: ObjectConfig = {
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
    };

    const objectConfigurationWithUserPass: ObjectConfig = {
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

    const irrelevantConfigFields: BaseConfig & Pick<ObjectConfig, "customRenderer"> = {
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
    };
});
