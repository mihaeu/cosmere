import * as fs from "fs";
import ConfluenceRenderer from "./ConfluenceRenderer";
import * as path from "path";
import { Config } from "./types/Config";
import { Page } from "./types/Page";
import { ConfluenceAPI } from "./ConfluenceAPI";
import signale from "signale";
import marked = require("marked");

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

function removeDynamicIds(s: string): string {
    return s.replace(/ (ac:macro-)?id="[^"]+"/g, "");
}

function isRemoteUpdateRequired(newContent: string, confluencePage: any): boolean {
    const local = removeDynamicIds(newContent)
        .trim()
        .replace(/&#39;/g, "'");
    const remote = removeDynamicIds(confluencePage.body.storage.value).trim();
    return local !== remote;
}

function extractAttachmentsFromPage(newContent: string): string[] {
    return (newContent.match(/<ri:attachment ri:filename="(.+?)" *\/>/g) || [])
        .map((attachment: string) => attachment.replace(/.*"(.+)".*/, "$1"))
        .filter((attachment: string) => !attachment.startsWith("http"));
}

function extractTitle(fileData: string) {
    const h1MarkdownRegex = /^# ?(?<title>[^\n\r]+)/;
    const matches = fileData.match(h1MarkdownRegex);
    if (!matches || !matches.groups) {
        throw new Error("Missing title property in config and no title found in markdown.");
    }
    return [matches.groups.title, fileData.replace(h1MarkdownRegex, "")];
}

export async function updatePage(confluenceAPI: ConfluenceAPI, pageData: Page, config: Config, force: boolean) {
    signale.start(`Starting to render "${pageData.file}"`);

    let fileData = fs.readFileSync(pageData.file, { encoding: "utf8" }).replace(/\|[ ]*\|/g, "|&nbsp;|");
    if (!pageData.title) {
        [pageData.title, fileData] = extractTitle(fileData);
    }

    let mdWikiData = marked(fileData, { renderer: new ConfluenceRenderer() });
    if (config.prefix) {
        mdWikiData =
            '<ac:structured-macro ac:name="info" ac:schema-version="1">' +
            "<ac:rich-text-body>" +
            `<p>${config.prefix}</p>` +
            "</ac:rich-text-body>" +
            "</ac:structured-macro>\n\n" +
            mdWikiData;
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
        signale.success(`Local cache for "${pageData.file}" is up to date, no update necessary`);
        return;
    }

    await confluenceAPI.deleteAttachments(pageData.pageId);

    const attachments = extractAttachmentsFromPage(mdWikiData);
    if (attachments) {
        attachments
            .filter((filename: string) => !fs.existsSync(path.resolve(path.dirname(pageData.file), filename)))
            .forEach((attachment: string) => {
                signale.error(`Attachment "${attachment}" not found.`);
            });
        for (const attachment of attachments) {
            const newFilename = cachePath + "/" + attachment.replace("/..", "_").replace("/", "_");
            const absoluteAttachmentPath = path.resolve(path.dirname(pageData.file), attachment);
            fs.copyFileSync(absoluteAttachmentPath, newFilename);

            signale.await(`Uploading attachment "${attachment}" for "${pageData.title}" ...`);
            await confluenceAPI.uploadAttachment(newFilename, pageData.pageId);
        }
        mdWikiData = mdWikiData.replace(/<ri:attachment ri:filename=".+?"/g, (s: string) => s.replace("/", "_"));
    }
    signale.await(`Fetch current page for "${pageData.title}" ...`);
    const confluencePage = (await confluenceAPI.currentPage(pageData.pageId)).data;
    if (isRemoteUpdateRequired(mdWikiData, confluencePage)) {
        confluencePage.title = pageData.title;
        confluencePage.body = {
            storage: {
                value: mdWikiData,
                representation: "storage",
            },
        };
        confluencePage.version.number = parseInt(confluencePage.version.number, 10) + 1;

        signale.await(`Update page "${pageData.title}" ...`);
        await confluenceAPI.updateConfluencePage(pageData.pageId, confluencePage);

        fs.writeFileSync(tempFile, mdWikiData, "utf-8");
        signale.success(`"${confluencePage.title}" saved in confluence.`);
        signale.success(`-> https://confluence.tngtech.com/pages/viewpage.action?pageId=${pageData.pageId}`);
    } else {
        signale.success(`No change in remote version for "${pageData.file}" detected, no update necessary`);
    }
}
