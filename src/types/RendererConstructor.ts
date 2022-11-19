import { Page } from "./Page";
import { marked, Renderer } from "marked";
import { Config } from "./Config";

export interface RendererConstructor {
    new (options: marked.MarkedOptions, config: Config, page: Page): Renderer;
}
