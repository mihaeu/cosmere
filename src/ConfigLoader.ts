import * as path from "path";
import * as fs from "fs";
import { Config } from "./Config";
import * as inquirer from "inquirer";
import signale from "signale";

export class ConfigLoader {
    static async load(configPath: string | null): Promise<Config> {
        return await ConfigLoader.promptUserAndPassIfNotSet(
            ConfigLoader.overwriteAuthFromConfigWithEnvIfPresent(ConfigLoader.readConfigFromFile(configPath)),
        );
    }

    private static readConfigFromFile(configPath: string | null): Config {
        configPath = path.resolve(configPath || path.join("markdown-to-confluence.json"));
        if (!fs.existsSync(configPath!)) {
            signale.fatal(`File "${configPath}" not found!`);
            process.exit(1);
        }

        let config = JSON.parse(fs.readFileSync(configPath!, "utf8")) as Config;
        for (const i in config.pages) {
            config.pages[i].file = fs.existsSync(config.pages[i].file)
                ? config.pages[i].file
                : path.resolve(path.dirname(configPath) + "/" + config.pages[i].file);
        }
        config.configPath = configPath;
        return config;
    }

    private static overwriteAuthFromConfigWithEnvIfPresent(config: Config): Config {
        config.user = process.env.CONFLUENCE_USERNAME || config.user;
        config.pass = process.env.CONFLUENCE_PASSWORD || config.pass;
        return config;
    }

    private static async promptUserAndPassIfNotSet(config: Config): Promise<Config> {
        const prompts = [];
        if (!config.user) {
            prompts.push({
                type: "input",
                name: "user",
                message: "Your Confluence username:",
            });
        }

        if (!config.pass) {
            prompts.push({
                type: "password",
                name: "pass",
                message: "Your Confluence password:",
            });
        }

        const answers = await inquirer.prompt(prompts);
        config.user = config.user || (answers.user as string);
        config.pass = config.pass || (answers.pass as string);

        return config;
    }
}
