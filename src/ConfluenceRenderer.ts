import { marked, Renderer } from "marked";
import { Config } from "./types/Config";
import { Page } from "./types/Page";
import * as path from "path";
import MarkedOptions = marked.MarkedOptions;

const escapeXmlCharacters = (s: string) => {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};

export default class ConfluenceRenderer extends Renderer<string> {
    private readonly config: Config;
    private readonly page: Page;
    readonly options: MarkedOptions;

    constructor(options: marked.MarkedOptions, config: Config, page: Page) {
        super(options);
        this.config = config;
        this.options = options;
        this.page = page;
    }

    private readonly langMap = [
        "bash",
        "html",
        "xml",
        "actionscript3",
        "bash",
        "csharp",
        "coldfusion",
        "cpp",
        "css",
        "delphi",
        "diff",
        "erlang",
        "groovy",
        "java",
        "javafx",
        "javascript",
        "perl",
        "php",
        "none",
        "powershell",
        "python",
        "ruby",
        "scala",
        "sql",
        "vb",
        "plantuml",
        "puml",
        "html/xml",
    ];

    private static hasDetailsBlock(html: string): boolean {
        return !!html.match(/<details>([\s\S]*)<\/details>/);
    }

    private renderDetailsBlock(html: string): string {
        const summary = html.match(/<summary>([\s\S]*)<\/summary>/)?.[1] ?? "Click here to expand ...";
        const contentWithoutSummaryTags = html
            .replace(/<summary>([\s\S]*)<\/summary>/, "")
            .replace(/<\/?details>/g, "");
        const content = marked(contentWithoutSummaryTags, {
            renderer: new ConfluenceRenderer(this.options, this.config, this.page),
            xhtml: true,
        });

        return (
            '<ac:structured-macro ac:name="expand">' +
            '<ac:parameter ac:name="title">' +
            summary +
            "</ac:parameter>" +
            "<ac:rich-text-body>" +
            content +
            "</ac:rich-text-body>" +
            "</ac:structured-macro>"
        );
    }

    link(href: string | null, title: string | null, text: string): string {
        if (href) {
            href = this.resolveLinks(href);
        }
        return super.link(escapeXmlCharacters(href ?? ""), title, text);
    }

    private resolveLinks(href: string): string {
        const absolutePath = path.resolve(path.dirname(this.page.file), href);
        const match = this.config.pages.find((page) => page.file === absolutePath);
        if (match) {
            href = `${this.config.baseUrl.replace("rest/api", "").replace(/\/$/, "")}/pages/viewpage.action?pageId=${
                match.pageId
            }`;
        }
        return href;
    }

    html(html: string): string {
        if (ConfluenceRenderer.hasDetailsBlock(html)) {
            return this.renderDetailsBlock(html);
        }
        return super.html(html);
    }

    image(href: string, title: string, text: string) {
        if (href.startsWith("http")) {
            return `<ac:image><ri:url ri:value="${escapeXmlCharacters(href)}" /></ac:image>`;
        }
        return `<ac:image><ri:attachment ri:filename="${escapeXmlCharacters(href)}" /></ac:image>`;
    }

    private readonly DEFAULT_LANGUAGE_FOR_CODE_BLOCK = "none";

    code(code: string, lang: string = this.DEFAULT_LANGUAGE_FOR_CODE_BLOCK) {
        lang =
            this.langMap.indexOf(lang.toLowerCase()) >= 0 ? lang.toLowerCase() : this.DEFAULT_LANGUAGE_FOR_CODE_BLOCK;
        return (
            '<ac:structured-macro ac:name="code" ac:schema-version="1">' +
            `<ac:parameter ac:name="&quot;language">${lang}</ac:parameter>` +
            '<ac:parameter ac:name="theme">RDark</ac:parameter>' +
            '<ac:parameter ac:name="borderStyle">solid</ac:parameter>' +
            '<ac:parameter ac:name="linenumbers">true</ac:parameter>' +
            '<ac:parameter ac:name="collapse">false</ac:parameter>' +
            `<ac:plain-text-body><![CDATA[${code}]]></ac:plain-text-body></ac:structured-macro>` +
            "\n"
        );
    }
}
