import { Page } from "./Page";

export type Config = {
    baseUrl: string;
    cachePath: string;
    user?: string;
    pass?: string;
    prefix: string;
    pages: Page[];
    configPath: string | null;
    addToc?: boolean;
};
