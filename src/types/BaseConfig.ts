import { Page } from "./Page";

export type BaseConfig = {
    baseUrl: string;
    cachePath: string;
    prefix: string;
    pages: Page[];
};
