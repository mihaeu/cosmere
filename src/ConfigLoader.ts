import * as path from "path";
import * as fs from "fs";
import { Config, ConfigKey, isBasicAuth, isTokenAuth } from "./types/Config";
import * as inquirer from "inquirer";
import signale from "signale";


function overwriteConfigKeyWithEnvVarIfPresent<T>(config: Partial<Config>, configKey: ConfigKey, envKey: string): Partial<Config> {
    if (configKey === "pages") {
        throw Error("Cannot override pages using environment variable");
    }

    if (process.env[envKey] !== undefined) {
        return { ...config, [configKey]: process.env[envKey] };
    } else {
        return config;
    }
}


export class ConfigLoader {
    static async load(configPath: string | null): Promise<Partial<Config>> {
        let config = ConfigLoader.readConfigFromFile(configPath);
        config = ConfigLoader.overwriteAuthFromConfigWithEnvIfPresent(config),
        config = await ConfigLoader.promptUserAndPassIfNoCredentialsSet(config);
        return config;
    }

    private static readConfigFromFile(configPath: string | null): Partial<Config> {
        configPath = path.resolve(configPath || path.join("cosmere.json"));
        if (!fs.existsSync(configPath!)) {
            signale.fatal(`File "${configPath}" not found!`);
            process.exit(1);
        }

        let config: Partial<Config> = JSON.parse(fs.readFileSync(configPath!, "utf8"));
        if (config.pages !== undefined) {
            for (const i in config.pages) {
                config.pages[i].file = path.isAbsolute(config.pages[i].file)
                    ? config.pages[i].file
                    : path.resolve(path.dirname(configPath) + "/" + config.pages[i].file);
            }
        }
        config.configPath = configPath;
        return config;
    }

    private static overwriteAuthFromConfigWithEnvIfPresent(config: Partial<Config>): Partial<Config> {
        config = overwriteConfigKeyWithEnvVarIfPresent(config, "user", "CONFLUENCE_USERNAME");
        config = overwriteConfigKeyWithEnvVarIfPresent(config, "pass", "CONFLUENCE_PASSWORD");
        config = overwriteConfigKeyWithEnvVarIfPresent(config, "authToken", "CONFLUENCE_AUTH_TOKEN");
        return config;
    }

    private static async promptUserAndPassIfNoCredentialsSet(config: Partial<Config>): Promise<Partial<Config>> {
        if (isTokenAuth(config)) {
            return config;
        }

        if (!("user" in config)) {
            const answers = await inquirer.prompt([{
                type: "input",
                name: "user",
                message: "Your Confluence username:",
            }]);
            (config as any).user = answers.user;
        }

        if (!("pass" in config)) {
            const answers = await inquirer.prompt([{
                type: "password",
                name: "pass",
                message: "Your Confluence password:",
            }]);
            (config as any).pass = answers.pass;
        }

        return config;
    }
}
