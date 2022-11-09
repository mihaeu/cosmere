import { Config } from "./types/Config";
import { ObjectConfig } from "./types/ObjectConfig";
import path from "path";

type AuthOptions = {
    user?: string;
    pass?: string;
    personalAccessToken?: string;
};

export class ObjectConfigLoader {
    static async load(objectConfig: ObjectConfig): Promise<Config> {
        const authOptions = await ObjectConfigLoader.fetchCredentialsFromObject(objectConfig);
        return ObjectConfigLoader.createConfig(objectConfig, ObjectConfigLoader.createAuthorizationToken(authOptions));
    }

    private static async fetchCredentialsFromObject(objectConfig: ObjectConfig): Promise<AuthOptions> {
        const hasUserPass = !!(objectConfig.user && objectConfig.pass);
        const hasPersonalAccessToken = !!objectConfig.personalAccessToken;
        if (!hasPersonalAccessToken && !hasUserPass) {
            throw new Error("Missing configuration! Config object does not provide a combination of your Confluence username and password or a personal access token.");
        }
        return {
            user: objectConfig.user,
            pass: objectConfig.pass,
            personalAccessToken: objectConfig.personalAccessToken,
        };
    }

    private static createAuthorizationToken(authOptions: AuthOptions): string {
        if (authOptions.personalAccessToken) {
            return `Bearer ${authOptions.personalAccessToken}`;
        }

        if (authOptions.user && authOptions.user.length > 0 && authOptions.pass && authOptions.pass.length > 0) {
            const encodedBasicToken = Buffer.from(`${authOptions.user}:${authOptions.pass}`).toString("base64");
            return `Basic ${encodedBasicToken}`;
        }

        throw new Error("Missing configuration! Config object does not provide a combination of your Confluence username and password or a personal access token.");
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
        }
    }

}
