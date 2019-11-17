import { Renderer, Slugger } from "marked";

export default class ConfluenceRenderer extends Renderer {
    private static readonly MAX_CODE_LINE = 20;

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

    paragraph(text: string) {
        return text + "\n\n";
    }

    html(html: string) {
        return html;
    }

    heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6, raw: string, slugger: Slugger): string {
        return `

h${level}. ${text}
`;
    }

    strong(text: string) {
        return `*${text}*`;
    }

    em(text: string) {
        return `_${text}_`;
    }

    del(text: string) {
        return `-${text}-`;
    }

    codespan(text: string) {
        return `{{${text}}}`;
    }

    blockquote(quote: string) {
        return `{quote}${quote}{quote}`;
    }

    br() {
        return "\n";
    }

    hr() {
        return "----";
    }

    link(href: string, title: string, text: string) {
        let arr = [href];
        if (text) {
            arr.unshift(text);
        }
        return "[" + arr.join("|") + "]";
    }

    list(body: string, ordered: boolean, start: number) {
        let arr = body
            .trim()
            .split("%%%")
            .filter((line: string) => line);
        let type = ordered ? "#" : "*";
        return (
            "\n" +
            arr
                .map((line: string) => {
                    return type + " " + line.replace(/\n([*#])/g, "\n$1$1");
                })
                .join("\n")
        );
    }

    listitem(text: string): string {
        return "%%%" + text;
    }

    image(href: string, title: string, text: string) {
        return "!" + href + "!";
    }

    table(header: string, body: string) {
        return header + body + "\n";
    }

    tablerow(content: string): string {
        return content + "\n";
    }

    tablecell(content: string, flags: any) {
        let type = flags.header ? "||" : "|";
        return type + content;
    }

    code(code: string, lang: string) {
        const params = {
            language: this.langMap.indexOf("lang") >= 0 ? lang.toLowerCase() : "none",
            borderStyle: "solid",
            theme: "RDark",
            linenumbers: true,
            collapse: code.split("\n").length > ConfluenceRenderer.MAX_CODE_LINE,
        };
        return `\n{code:"${ConfluenceRenderer.stringifyObject(params)}}${code}{code}`;
    }

    private static stringifyObject(o: object) {
        return Object.keys(o)
            // @ts-ignore https://github.com/microsoft/TypeScript/issues/20503
            .map(key => `${key}=${o[key]}`)
            .join("|");
    }
}
