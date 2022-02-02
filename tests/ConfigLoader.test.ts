import { ConfigLoader } from "../src/ConfigLoader";

describe("ConfigLoader", () => {
    it("should create bearer token from personal access token", async () => {
        expect(
            await ConfigLoader.load(__dirname + "/resources/test-config-with-personal-access-token-auth.json"),
        ).toEqual({
            authorizationToken: "Bearer unbearable",
            configPath: __dirname + "/resources/test-config-with-personal-access-token-auth.json",
            ...irrelevantConfigFields,
        });
    });

    it("should create base64 basic token from username and password", async () => {
        expect(await ConfigLoader.load(__dirname + "/resources/test-config-with-user-pass-auth.json")).toEqual({
            authorizationToken: "Basic dXNlcjpwYXNz",
            configPath: __dirname + "/resources/test-config-with-user-pass-auth.json",
            ...irrelevantConfigFields,
        });
    });

    const irrelevantConfigFields = {
        baseUrl: "https://confluence.custom.host/rest/api",
        cachePath: "cache/",
        pages: [
            {
                file: __dirname + "/resources/README.md",
                pageId: "123456789",
            },
        ],
        prefix: "This document is automatically generated. Please don't edit it directly!",
    };
});
