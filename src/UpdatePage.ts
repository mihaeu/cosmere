import * as fs from "fs";
import ConfluenceRenderer from "./ConfluenceRenderer";
import * as path from "path";
import { Config } from "./Config";
import { Page } from "./Page";
import { ConfluenceAPI } from "./ConfluenceAPI";
import signale from "signale";
import marked = require("marked");

function replacePlantUMLCodefenceWithConfluenceMacro(body: string) {
    return body.replace(
        /<ac:structured-macro ac:name="code"[\s\S]+?<ac:plain-text-body>(<!\[CDATA\[\s*?@startuml[\s\S]+?@enduml\s*?]]>)<\/ac:plain-text-body><\/ac:structured-macro>/,
        '<ac:structured-macro ac:name="plantuml" ac:schema-version="1"><ac:parameter ac:name="atlassian-macro-output-type">INLINE</ac:parameter><ac:plain-text-body>$1</ac:plain-text-body></ac:structured-macro>',
    );
}

function mkdir(cachePath: string) {
    if (process.version.match(/^v\d\d\./)) {
        fs.mkdirSync(cachePath, { recursive: true });
    } else {
        if (fs.existsSync(path.dirname(cachePath))) {
            fs.mkdirSync(fs.existsSync(path.dirname(cachePath)) ? cachePath : path.dirname(cachePath));
        } else {
            mkdir(path.dirname(cachePath));
            fs.mkdirSync(cachePath);
        }
    }
}

function getCachePath(config: Config) {
    return path.isAbsolute(config.cachePath)
      ? config.cachePath
      : path.resolve(path.dirname(config.configPath!) + "/" + config.cachePath);
}

export async function updatePage(confluenceAPI: ConfluenceAPI, pageData: Page, config: Config, force: boolean) {
    signale.start(`Starting to render "${pageData.file}"`);

    const fileData = fs.readFileSync(pageData.file, { encoding: "utf8" }).replace(/\|[ ]*\|/g, "|&nbsp;|");
    let mdWikiData = marked(fileData, { renderer: new ConfluenceRenderer() });
    if (config.prefix) {
        mdWikiData = `{info}${config.prefix}{info}\n\n${mdWikiData}`;
    }

    const cachePath = getCachePath(config);
    if (!fs.existsSync(cachePath)) {
        mkdir(cachePath);
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
        signale.success(`No content update necessary for "${pageData.file}"`);
        return;
    }

    signale.await(`Converting "${pageData.title}" to wiki format ...`);
    const newContent = await confluenceAPI.convertToWikiFormat(mdWikiData);
    newContent.data.value = replacePlantUMLCodefenceWithConfluenceMacro(newContent.data.value);

    signale.await(`Deleting attachments for "${pageData.title}" ...`);
    await confluenceAPI.deleteAttachments(pageData.pageId);

    const attachments = newContent.data.value.match(/<ri:attachment ri:filename="(.+?)" *\/>/g);
    if (attachments) {
        attachments
            .map((s: string) => s.replace(/.*"(.+)".*/, "$1"))
            .filter((filename: string) => fs.existsSync(filename));
        for (const attachment of attachments) {
            const newFilename = __dirname + "/../tmp/" + attachment.replace("/..", "_").replace("/", "_");
            fs.copyFileSync(__dirname + "/../" + attachment, newFilename);

            signale.await(`Uploading attachment ${attachment} for "${pageData.title}" ...`);
            await confluenceAPI.uploadAttachment(newFilename, pageData.pageId);
        }
        newContent.data.value = newContent.data.value.replace(/<ri:attachment ri:filename=".+?"/g, (s: string) =>
            s.replace("/", "_"),
        );
    }

    signale.await(`Fetch current page for "${pageData.title}" ...`);
    const confluencePage = (await confluenceAPI.currentPage(pageData.pageId)).data;
    confluencePage.title = pageData.title;
    confluencePage.body = {
        storage: {
            value: newContent.data.value,
            representation: "storage",
        },
    };
    confluencePage.version.number = parseInt(confluencePage.version.number, 10) + 1;

    signale.await(`Update page "${pageData.title}" ...`);
    await confluenceAPI.updateConfluencePage(pageData.pageId, confluencePage);

    fs.writeFileSync(tempFile, mdWikiData, "utf-8");
    signale.success(`"${confluencePage.title}" saved in confluence.`);
}
