import * as path from "path";
import { FileConfigLoader } from "../src/FileConfigLoader";
import { BaseConfig } from "../src/types/BaseConfig";

describe("FileConfigLoader", () => {
    it("should create bearer token from personal access token", async () => {
        expect(
            await FileConfigLoader.load(path.join(__dirname, "resources", "test-config-with-personal-access-token-auth.json")),
        ).toEqual({
            authorizationToken: "Bearer unbearable",
            configPath: path.join(__dirname, "resources", "test-config-with-personal-access-token-auth.json"),
            ...irrelevantConfigFields,
        });
    });

    it("should create base64 basic token from username and password", async () => {
        expect(await FileConfigLoader.load(path.join(__dirname, "resources", "test-config-with-user-pass-auth.json"))).toEqual({
            authorizationToken: "Basic dXNlcjpwYXNz",
            configPath: path.join(__dirname, "resources", "test-config-with-user-pass-auth.json"),
            ...irrelevantConfigFields,
        });
    });

    const irrelevantConfigFields: BaseConfig = {
        baseUrl: "https://confluence.custom.host/rest/api",
        cachePath: "cache/",
        pages: [
            {
                file: path.join(__dirname, "resources", "README.md"),
                pageId: "123456789",
            },
        ],
        prefix: "This document is automatically generated. Please don't edit it directly!",
    };
});
