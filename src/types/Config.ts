import { Page } from "./Page";

export type BasicAuthConfig = {
    user: string;
    pass: string;
};

export type TokenAuthConfig = {
    authToken: string;
};

export type AuthConfig = BasicAuthConfig | TokenAuthConfig;

export type Config = AuthConfig & {
    baseUrl: string;
    cachePath: string;
    prefix?: string;
    pages: Page[];
    configPath: string | null;
};

export type ConfigKey = keyof BasicAuthConfig | keyof TokenAuthConfig | keyof Config;

export function isBasicAuth(authConfig: Object): authConfig is BasicAuthConfig {
    return authConfig.hasOwnProperty("user");
}

export function isTokenAuth(authConfig: Object): authConfig is TokenAuthConfig {
    return authConfig.hasOwnProperty("authToken");
}
