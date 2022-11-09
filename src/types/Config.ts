import { BaseConfig } from "./BaseConfig";
import { RendererConstructor } from "./RendererConstructor";

export type Config = BaseConfig & {
    configPath: string;
    authorizationToken: string;
    customRenderer?: RendererConstructor;
};
