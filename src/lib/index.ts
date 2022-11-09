import { Config } from "../types/Config";
import { ObjectConfigLoader } from "../ObjectConfigLoader";
import { ConfluenceAPI } from "../api/ConfluenceAPI";
import { updatePage } from "../UpdatePage";
import { ObjectConfig } from "../types/ObjectConfig";

const DEFAULTS = {
    insecure: false,
    force: false,
    fileRoot: process.cwd(),
};

export default async function(configOptions: ObjectConfig) {
    const config: Config = await ObjectConfigLoader.load(Object.assign({}, DEFAULTS, configOptions));
    const confluenceAPI = new ConfluenceAPI(config.baseUrl, config.authorizationToken, configOptions.insecure);

    for (const pageData of config.pages) {
        await updatePage(confluenceAPI, pageData, config, configOptions.force);
    }
}
