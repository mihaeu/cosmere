import * as path from "path";
import * as fs from "fs";
import { Config } from "./types/Config";
import * as inquirer from "inquirer";
import signale from "signale";
import { FileConfig } from "./types/FileConfig";
import { AuthOptions, createAuthorizationToken, MISSING_AUTH_MESSAGE } from "./auth/createAuthorizationToken";

export class FileConfigLoader {
    static async load(configPath: string | null): Promise<Config> {
        const fileConfig = FileConfigLoader.readConfigFromFile(configPath);
        const authOptions = await FileConfigLoader.promptForMissingCredentials(
            FileConfigLoader.useAuthOptionsFromEnvIfPresent(FileConfigLoader.authOptionsFromFileConfig(fileConfig)),
        );
        const authorizationToken = createAuthorizationToken(authOptions);
        if (!authorizationToken) {
            signale.fatal(MISSING_AUTH_MESSAGE);
            process.exit(2);
        }
        return FileConfigLoader.createConfig(fileConfig, authorizationToken);
    }

    private static readConfigFromFile(configPath: string | null): FileConfig {
        configPath = path.resolve(configPath || path.join("cosmere.json"));
        if (!fs.existsSync(configPath!)) {
            signale.fatal(`File "${configPath}" not found!`);
            process.exit(1);
        }

        let config = JSON.parse(fs.readFileSync(configPath!, "utf8")) as Omit<FileConfig, "configPath">;
        for (const i in config.pages) {
            config.pages[i].file = path.isAbsolute(config.pages[i].file)
                ? config.pages[i].file
                : path.resolve(path.dirname(configPath) + "/" + config.pages[i].file);
        }

        return {
            ...config,
            configPath,
        };
    }

    private static useAuthOptionsFromEnvIfPresent(authOptions: AuthOptions): AuthOptions {
        return {
            user: process.env.CONFLUENCE_USERNAME || authOptions.user,
            pass: process.env.CONFLUENCE_PASSWORD || authOptions.pass,
            personalAccessToken: process.env.CONFLUENCE_PERSONAL_ACCESS_TOKEN || authOptions.personalAccessToken,
        };
    }

    private static async promptForMissingCredentials(authOptions: AuthOptions): Promise<AuthOptions> {
        if (authOptions.personalAccessToken && authOptions.personalAccessToken.length > 0) {
            return authOptions;
        }

        const prompts = [];
        if (!authOptions.user) {
            prompts.push({
                type: "input",
                name: "user",
                message: "Your Confluence username:",
            });
        }

        if (!authOptions.pass) {
            prompts.push({
                type: "password",
                name: "pass",
                message: "Your Confluence password or API token:",
            });
        }

        const answers = await inquirer.prompt(prompts);
        return {
            user: authOptions.user || (answers.user as string),
            pass: authOptions.pass || (answers.pass as string),
            personalAccessToken: authOptions.personalAccessToken,
        };
    }

    private static authOptionsFromFileConfig(fileConfig: FileConfig): AuthOptions {
        return {
            user: fileConfig.user,
            pass: fileConfig.pass,
            personalAccessToken: fileConfig.personalAccessToken,
        };
    }

    private static createConfig(fileConfig: FileConfig, authorizationToken: string): Config {
        return {
            baseUrl: fileConfig.baseUrl,
            cachePath: fileConfig.cachePath,
            prefix: fileConfig.prefix,
            pages: fileConfig.pages,
            configPath: fileConfig.configPath,
            authorizationToken: authorizationToken,
        };
    }
}
