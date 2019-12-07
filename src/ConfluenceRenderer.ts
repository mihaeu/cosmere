import { Renderer } from "marked";

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

    image(href: string, title: string, text: string) {
        if (href.startsWith('http')) {
            return `<ac:image><ri:url ri:value="${href}" /></ac:image>`;
        }
        return `<ac:image><ri:attachment ri:filename="${href}" /></ac:image>`;
    }

    code(code: string, lang: string) {
        lang = this.langMap.indexOf("lang") >= 0 ? lang.toLowerCase() : "none";
        return `<ac:structured-macro ac:name="code" ac:schema-version="1"><ac:parameter ac:name="&quot;language">${lang}</ac:parameter><ac:parameter ac:name="theme">RDark</ac:parameter><ac:parameter ac:name="borderStyle">solid</ac:parameter><ac:parameter ac:name="linenumbers">true</ac:parameter><ac:parameter ac:name="collapse">false</ac:parameter><ac:plain-text-body><![CDATA[${code}]]></ac:plain-text-body></ac:structured-macro>
`;
    }
}
