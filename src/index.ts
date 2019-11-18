import * as fs from "fs";
import ConfluenceRenderer from "./ConfluenceRenderer";

const axios = require("axios");
const axiosFile = require("axios-file");
const inquirer = require("inquirer");
const path = require("path");
const marked = require("marked");

type Page = {
    pageId: string;
    file: string;
    title: string;
};
type Config = {
    baseUrl: string;
    cachePath: string;
    user?: string;
    pass?: string;
    prefix: string;
    pages: Page[];
    configPath: string | null;
};
type AuthHeaders = {
    auth: {
        username: string;
        password: string;
    };
};

function readConfigFromFile(configPath: string | null): Config {
    configPath = path.resolve(configPath || path.join("markdown-to-confluence.json"));
    if (!fs.existsSync(configPath!)) {
        console.error(`File "${configPath}" not found!`);
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

function overwriteAuthFromConfigWithEnvIfPresent(config: Config): Config {
    config.user = process.env.CONFLUENCE_USERNAME || config.user;
    config.pass = process.env.CONFLUENCE_PASSWORD || config.pass;
    return config;
}

async function promptUserAndPassIfNotSet(config: Config): Promise<Config> {
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
    config.user = config.user || answers.user;
    config.pass = config.pass || answers.pass;

    return config;
}

async function convertToWikiFormat(config: Config, mdWikiData: string, auth: AuthHeaders) {
    return await axios.post(
        `${config.baseUrl}/contentbody/convert/storage`,
        {
            value: mdWikiData,
            representation: "wiki",
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
            ...auth,
        },
    );
}

async function updateConfluencePage(
    currentPage: any,
    pageData: Page,
    newContent: any,
    config: Config,
    auth: AuthHeaders,
) {
    currentPage.title = pageData.title;
    currentPage.body = {
        storage: {
            value: newContent.data.value,
            representation: "storage",
        },
    };
    currentPage.version.number = parseInt(currentPage.version.number, 10) + 1;
    await axios.put(`${config.baseUrl}/content/${pageData.pageId}`, currentPage, {
        headers: {
            "Content-Type": "application/json",
        },
        ...auth,
    });
}

async function deleteAttachments(pageData: Page, config: Config, auth: AuthHeaders) {
    const attachments = await axios.get(`${config.baseUrl}/content/${pageData.pageId}/child/attachment`, auth);
    attachments.data.results.forEach((attachment: any) =>
        axios.delete(`https://confluence.tngtech.com/rest/api/content/${attachment.id}`, auth),
    );
}

async function updatePage(pageData: Page, config: Config, force: boolean) {
    console.debug(`Starting to render "${pageData.file}"`);

    const fileData = fs.readFileSync(pageData.file, { encoding: "utf8" }).replace(/\|[ ]*\|/g, "|&nbsp;|");
    let mdWikiData = marked(fileData, { renderer: new ConfluenceRenderer() });
    if (config.prefix) {
        mdWikiData = `{info}${config.prefix}{info}\n\n${mdWikiData}`;
    }

    const cachePath = fs.existsSync(config.cachePath)
        ? config.cachePath
        : path.resolve(path.dirname(config.configPath!) + "/" + config.cachePath);
    if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, { recursive: true });
    }
    const tempFile = `${cachePath}/${pageData.pageId}`;

    let needsContentUpdate = true;
    if (fs.existsSync(tempFile)) {
        const fileContent = fs.readFileSync(tempFile, "utf-8");

        if (fileContent === mdWikiData) {
            needsContentUpdate = false;
        }
    }
    if (!force && !needsContentUpdate) {
        console.info(`No content update necessary for "${pageData.file}"`);
        return;
    }

    const auth = {
        auth: {
            username: config.user!,
            password: config.pass!,
        },
    };

    console.info(`Converting "${pageData.title}" to wiki format ...`);
    const newContent = await convertToWikiFormat(config, mdWikiData, auth);
    newContent.data.value = newContent.data.value.replace(
        /<ac:structured-macro ac:name="code"[\s\S]+?<ac:plain-text-body>(<!\[CDATA\[\s*?@startuml[\s\S]+?@enduml\s*?]]>)<\/ac:plain-text-body><\/ac:structured-macro>/,
        '<ac:structured-macro ac:name="plantuml" ac:schema-version="1"><ac:parameter ac:name="atlassian-macro-output-type">INLINE</ac:parameter><ac:plain-text-body>$1</ac:plain-text-body></ac:structured-macro>',
    );

    console.info(`Deleting attachments for "${pageData.title}" ...`);
    await deleteAttachments(pageData, config, auth);

    const attachments = newContent.data.value.match(/<ri:attachment ri:filename="(.+?)" *\/>/g);
    if (attachments) {
        attachments
            .map((s: string) => s.replace(/.*"(.+)".*/, "$1"))
            .filter((filename: string) => fs.existsSync(filename))
            .forEach(async (filename: string) => {
                const newFilename = __dirname + "/../tmp/" + filename.replace("/..", "_").replace("/", "_");
                fs.copyFileSync(__dirname + "/../" + filename, newFilename);
                console.info(`Uploading attachment ${filename} for "${pageData.title}" ...`);
                await uploadAttachment(newFilename, pageData, config, auth);
            });
        newContent.data.value = newContent.data.value.replace(/<ri:attachment ri:filename=".+?"/g, (s: string) =>
            s.replace("/", "_"),
        );
    }

    console.info(`Fetch current page for "${pageData.title}" ...`);
    const currentPage = (await axios.get(`${config.baseUrl}/content/${pageData.pageId}`, auth)).data;

    console.info(`Update page "${pageData.title}" ...`);
    await updateConfluencePage(currentPage, pageData, newContent, config, auth);

    fs.writeFileSync(tempFile, mdWikiData, "utf-8");
    console.info(`"${currentPage.title}" saved in confluence.`);
}

async function uploadAttachment(filename: string, pageData: Page, config: Config, auth: AuthHeaders) {
    await axiosFile({
        url: `${config.baseUrl}/content/${pageData.pageId}/child/attachment`,
        method: "post",
        headers: {
            "X-Atlassian-Token": "nocheck",
        },
        data: {
            file: fs.createReadStream(filename),
        },
        ...auth,
    });
}

export async function md2confluence(configPath: string | null, force: boolean = false) {
    let config: Config = await promptUserAndPassIfNotSet(
        overwriteAuthFromConfigWithEnvIfPresent(readConfigFromFile(configPath)),
    );

    config.pages.forEach(async (pageData: Page) => await updatePage(pageData, config, force));
}

export function generateConfig(configPath: string | null) {
    fs.writeFileSync(
        configPath || path.join("markdown-to-confluence.json")!,
        `{
  "baseUrl": "YOUR_BASE_URL",
  "user": "YOUR_USERNAME",
  "pass": "YOUR_PASSWORD",
  "cachePath": "build",
  "prefix": "This document is automatically generated. Please don't edit it directly!",
  "pages": [
    {
      "pageId": "1234567890",
      "file": "README.md",
      "title": "Optional title in the confluence page"
    }
  ]
}
`,
    );
}
