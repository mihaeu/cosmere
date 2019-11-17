"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var marked_1 = require("marked");
var ConfluenceRenderer = /** @class */ (function (_super) {
    __extends(ConfluenceRenderer, _super);
    function ConfluenceRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.langMap = [
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
        return _this;
    }
    ConfluenceRenderer.prototype.paragraph = function (text) {
        return text + "\n\n";
    };
    ConfluenceRenderer.prototype.html = function (html) {
        return html;
    };
    ConfluenceRenderer.prototype.heading = function (text, level, raw, slugger) {
        return "\n\nh" + level + ". " + text + "\n";
    };
    ConfluenceRenderer.prototype.strong = function (text) {
        return "*" + text + "*";
    };
    ConfluenceRenderer.prototype.em = function (text) {
        return "_" + text + "_";
    };
    ConfluenceRenderer.prototype.del = function (text) {
        return "-" + text + "-";
    };
    ConfluenceRenderer.prototype.codespan = function (text) {
        return "{{" + text + "}}";
    };
    ConfluenceRenderer.prototype.blockquote = function (quote) {
        return "{quote}" + quote + "{quote}";
    };
    ConfluenceRenderer.prototype.br = function () {
        return "\n";
    };
    ConfluenceRenderer.prototype.hr = function () {
        return "----";
    };
    ConfluenceRenderer.prototype.link = function (href, title, text) {
        var arr = [href];
        if (text) {
            arr.unshift(text);
        }
        return "[" + arr.join("|") + "]";
    };
    ConfluenceRenderer.prototype.list = function (body, ordered, start) {
        var arr = body
            .trim()
            .split("%%%")
            .filter(function (line) { return line; });
        var type = ordered ? "#" : "*";
        return ("\n" +
            arr
                .map(function (line) {
                return type + " " + line.replace(/\n([*#])/g, "\n$1$1");
            })
                .join("\n"));
    };
    ConfluenceRenderer.prototype.listitem = function (text) {
        return "%%%" + text;
    };
    ConfluenceRenderer.prototype.image = function (href, title, text) {
        return "!" + href + "!";
    };
    ConfluenceRenderer.prototype.table = function (header, body) {
        return header + body + "\n";
    };
    ConfluenceRenderer.prototype.tablerow = function (content) {
        return content + "\n";
    };
    ConfluenceRenderer.prototype.tablecell = function (content, flags) {
        var type = flags.header ? "||" : "|";
        return type + content;
    };
    ConfluenceRenderer.prototype.code = function (code, lang) {
        var params = {
            language: this.langMap.indexOf("lang") >= 0 ? lang.toLowerCase() : "none",
            borderStyle: "solid",
            theme: "RDark",
            linenumbers: true,
            collapse: code.split("\n").length > ConfluenceRenderer.MAX_CODE_LINE,
        };
        return "\n{code:\"" + ConfluenceRenderer.stringifyObject(params) + "}" + code + "{code}";
    };
    ConfluenceRenderer.stringifyObject = function (o) {
        return Object.keys(o)
            // @ts-ignore https://github.com/microsoft/TypeScript/issues/20503
            .map(function (key) { return key + "=" + o[key]; })
            .join("|");
    };
    ConfluenceRenderer.MAX_CODE_LINE = 20;
    return ConfluenceRenderer;
}(marked_1.Renderer));
exports.default = ConfluenceRenderer;
