import { Config } from "./types/Config";
import { ObjectConfig } from "./types/ObjectConfig";
import path from "path";
import { AuthOptions, createAuthorizationToken, MISSING_AUTH_MESSAGE } from "./auth/createAuthorizationToken";

export class ObjectConfigLoader {
    static async load(objectConfig: ObjectConfig): Promise<Config> {
        const authOptions = ObjectConfigLoader.authOptionsFromObjectConfig(objectConfig);
        const authorizationToken = createAuthorizationToken(authOptions);
        if (!authorizationToken) {
            throw new Error(MISSING_AUTH_MESSAGE);
        }
        return ObjectConfigLoader.createConfig(objectConfig, authorizationToken);
    }

    private static authOptionsFromObjectConfig(objectConfig: ObjectConfig): AuthOptions {
        return {
            user: objectConfig.user,
            pass: objectConfig.pass,
            personalAccessToken: objectConfig.personalAccessToken,
        };
    }

    private static normalizeFilePaths(objectConfig: ObjectConfig): ObjectConfig {
        for (const i in objectConfig.pages) {
            objectConfig.pages[i].file = path.isAbsolute(objectConfig.pages[i].file)
                ? objectConfig.pages[i].file
                : path.resolve(path.dirname(objectConfig.fileRoot) + "/" + objectConfig.pages[i].file);
        }

        return objectConfig;
    }

    private static createConfig(objectConfig: ObjectConfig, authorizationToken: string): Config {
        const config = ObjectConfigLoader.normalizeFilePaths(objectConfig);
        return {
            baseUrl: config.baseUrl,
            cachePath: config.cachePath,
            prefix: config.prefix,
            pages: config.pages,
            configPath: config.fileRoot || process.cwd(),
            customRenderer: config.customRenderer,
            authorizationToken: authorizationToken,
        };
    }
}
