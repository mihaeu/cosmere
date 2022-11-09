import { BaseConfig } from "./BaseConfig";

export type FileConfig = BaseConfig & {
    configPath: string;
    user?: string;
    pass?: string;
    personalAccessToken?: string;
};
