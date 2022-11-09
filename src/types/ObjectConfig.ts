import { BaseConfig } from "./BaseConfig";
import { RendererConstructor } from "./RendererConstructor";

export type ObjectConfig = BaseConfig & {
    fileRoot: string;
    user?: string;
    pass?: string;
    personalAccessToken?: string;
    insecure: boolean;
    force: boolean;
    customRenderer?: RendererConstructor;
};
