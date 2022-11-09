import { Config } from "../types/Config";
import { FileConfigLoader } from "../FileConfigLoader";
import { ConfluenceAPI } from "../api/ConfluenceAPI";
import { updatePage } from "../UpdatePage";

export default async function(configPath: string | null, force: boolean = false, insecure: boolean = false) {
    const config: Config = await FileConfigLoader.load(configPath);
    const confluenceAPI = new ConfluenceAPI(config.baseUrl, config.authorizationToken, insecure);

    for (const pageData of config.pages) {
        await updatePage(confluenceAPI, pageData, config, force);
    }
}
