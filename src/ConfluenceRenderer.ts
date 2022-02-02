import marked, { Renderer } from "marked";

export default class ConfluenceRenderer extends Renderer {
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

    private static renderDetailsBlock(html: string): string {
        const summary = html.match(/<summary>([\s\S]*)<\/summary>/)?.[1] ?? "Click here to expand ...";
        const contentWithoutSummaryTags = html
            .replace(/<summary>([\s\S]*)<\/summary>/, "")
            .replace(/<\/?details>/g, "");
        const content = marked(contentWithoutSummaryTags, {
            renderer: new ConfluenceRenderer(),
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

    html(html: string): string {
        if (ConfluenceRenderer.hasDetailsBlock(html)) {
            return ConfluenceRenderer.renderDetailsBlock(html);
        }
        return super.html(html);
    }

    image(href: string, title: string, text: string) {
        if (href.startsWith("http")) {
            return `<ac:image><ri:url ri:value="${href}" /></ac:image>`;
        }
        return `<ac:image><ri:attachment ri:filename="${href}" /></ac:image>`;
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
