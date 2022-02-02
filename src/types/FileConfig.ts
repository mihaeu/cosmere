import { Page } from "./Page";

export type FileConfig = {
    baseUrl: string;
    cachePath: string;
    prefix: string;
    pages: Page[];
    configPath: string;
    user?: string;
    pass?: string;
    personalAccessToken?: string;
};
