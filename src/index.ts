import * as fs from "fs";
import ConfluenceRenderer from "./ConfluenceRenderer";
import * as path from "path";
import { Config } from "./Config";
import { Page } from "./Page";
import { ConfigLoader } from "./ConfigLoader";
import { ConfluenceAPI } from "./ConfluenceAPI";
import marked = require("marked");

function replacePlantUMLCodefenceWithConfluenceMacro(body: string) {
    return body.replace(
      /<ac:structured-macro ac:name="code"[\s\S]+?<ac:plain-text-body>(<!\[CDATA\[\s*?@startuml[\s\S]+?@enduml\s*?]]>)<\/ac:plain-text-body><\/ac:structured-macro>/,
      '<ac:structured-macro ac:name="plantuml" ac:schema-version="1"><ac:parameter ac:name="atlassian-macro-output-type">INLINE</ac:parameter><ac:plain-text-body>$1</ac:plain-text-body></ac:structured-macro>',
    );
}

async function updatePage(confluenceAPI: ConfluenceAPI, pageData: Page, config: Config, force: boolean) {
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

    console.info(`Converting "${pageData.title}" to wiki format ...`);
    const newContent = await confluenceAPI.convertToWikiFormat(mdWikiData);
    newContent.data.value = replacePlantUMLCodefenceWithConfluenceMacro(newContent.data.value);

    console.info(`Deleting attachments for "${pageData.title}" ...`);
    await confluenceAPI.deleteAttachments(pageData.pageId);

    const attachments = newContent.data.value.match(/<ri:attachment ri:filename="(.+?)" *\/>/g);
    if (attachments) {
        attachments
            .map((s: string) => s.replace(/.*"(.+)".*/, "$1"))
            .filter((filename: string) => fs.existsSync(filename));
        for (const attachment of attachments) {
            const newFilename = __dirname + "/../tmp/" + attachment.replace("/..", "_").replace("/", "_");
            fs.copyFileSync(__dirname + "/../" + attachment, newFilename);

            console.info(`Uploading attachment ${attachment} for "${pageData.title}" ...`);
            await confluenceAPI.uploadAttachment(newFilename, pageData.pageId);
        }
        newContent.data.value = newContent.data.value.replace(/<ri:attachment ri:filename=".+?"/g, (s: string) =>
            s.replace("/", "_"),
        );
    }

    console.info(`Fetch current page for "${pageData.title}" ...`);
    const confluencePage = (await confluenceAPI.currentPage(pageData.pageId)).data;
    confluencePage.title = pageData.title;
    confluencePage.body = {
        storage: {
            value: newContent.data.value,
            representation: "storage",
        },
    };
    confluencePage.version.number = parseInt(confluencePage.version.number, 10) + 1;

    console.info(`Update page "${pageData.title}" ...`);
    await confluenceAPI.updateConfluencePage(pageData.pageId, confluencePage);

    fs.writeFileSync(tempFile, mdWikiData, "utf-8");
    console.info(`"${confluencePage.title}" saved in confluence.`);
}

export async function md2confluence(configPath: string | null, force: boolean = false) {
    const config: Config = await ConfigLoader.load(configPath);

    const confluenceAPI = new ConfluenceAPI(config.baseUrl, {
        auth: {
            username: config.user!,
            password: config.pass!,
        },
    });

    for (const pageData of config.pages) {
        await updatePage(confluenceAPI, pageData, config, force);
    }
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
