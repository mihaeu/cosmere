import ConfluenceRenderer from "../src/ConfluenceRenderer";
import { Config } from "../src/types/Config";

describe("ConfluenceRenderer", () => {
    let confluenceRenderer: ConfluenceRenderer;
    const currentPage = { pageId: "123", title: "", file: "/tmp/test.md" };
    const config: Config = {
        baseUrl: "https://my-confluence.com/rest/api",
        cachePath: "",
        prefix: "",
        pages: [currentPage, { pageId: "456", title: "", file: "/tmp/other.md" }],
        configPath: "",
        authorizationToken: "",
    };

    beforeEach(() => {
        confluenceRenderer = new ConfluenceRenderer({}, config, currentPage);
    });

    it("converts local image href to confluence attachment", () => {
        expect(confluenceRenderer.image("example.gif", "title", "text")).toBe(
            '<ac:image><ri:attachment ri:filename="example.gif" /></ac:image>',
        );
    });

    it("converts local image href to confluence attachment and converts XML characters", () => {
        expect(confluenceRenderer.image(`example.gif?test=<>&'"`, "title", "text")).toBe(
            '<ac:image><ri:attachment ri:filename="example.gif?test=&lt;&gt;&amp;&apos;&quot;" /></ac:image>',
        );
    });

    it("converts remote images to confluence image", () => {
        expect(confluenceRenderer.image("http://example.com/example.gif", "title", "text")).toBe(
            '<ac:image><ri:url ri:value="http://example.com/example.gif" /></ac:image>',
        );
    });

    it("converts remote images to confluence image and converts XML characters", () => {
        expect(confluenceRenderer.image(`http://example.com/example.gif?test=<>&'"`, "title", "text")).toBe(
            '<ac:image><ri:url ri:value="http://example.com/example.gif?test=&lt;&gt;&amp;&apos;&quot;" /></ac:image>',
        );
    });

    it("converts code blocks to confluence code macro with matching language", () => {
        expect(confluenceRenderer.code('System.out.println("Hello World!");', "java")).toBe(
            '<ac:structured-macro ac:name="code" ac:schema-version="1">' +
                '<ac:parameter ac:name="&quot;language">java</ac:parameter>' +
                '<ac:parameter ac:name="theme">RDark</ac:parameter>' +
                '<ac:parameter ac:name="borderStyle">solid</ac:parameter>' +
                '<ac:parameter ac:name="linenumbers">true</ac:parameter>' +
                '<ac:parameter ac:name="collapse">false</ac:parameter>' +
                '<ac:plain-text-body><![CDATA[System.out.println("Hello World!");]]></ac:plain-text-body>' +
                "</ac:structured-macro>" +
                "\n",
        );
    });

    it("converts code blocks to confluence code macro with no syntax highlighting for incompatible languages", () => {
        expect(confluenceRenderer.code('System.out.println("Hello World!");', "go++")).toBe(
            '<ac:structured-macro ac:name="code" ac:schema-version="1">' +
                '<ac:parameter ac:name="&quot;language">none</ac:parameter>' +
                '<ac:parameter ac:name="theme">RDark</ac:parameter>' +
                '<ac:parameter ac:name="borderStyle">solid</ac:parameter>' +
                '<ac:parameter ac:name="linenumbers">true</ac:parameter>' +
                '<ac:parameter ac:name="collapse">false</ac:parameter>' +
                '<ac:plain-text-body><![CDATA[System.out.println("Hello World!");]]></ac:plain-text-body>' +
                "</ac:structured-macro>" +
                "\n",
        );
    });

    it("converts <details> tags to Confluence expand macro", () => {
        const input =
            `<details>
        <summary>Short Summary</summary>
        More elaborate text ` +
            "`with other things like monospace`" +
            `
      </details>`;
        expect(confluenceRenderer.html(input)).toBe(
            '<ac:structured-macro ac:name="expand">' +
                '<ac:parameter ac:name="title">' +
                "Short Summary" +
                "</ac:parameter>" +
                "<ac:rich-text-body>" +
                '<ac:structured-macro ac:name="code" ac:schema-version="1">' +
                '<ac:parameter ac:name="&quot;language">' +
                "none" +
                "</ac:parameter>" +
                '<ac:parameter ac:name="theme">' +
                "RDark" +
                "</ac:parameter>" +
                '<ac:parameter ac:name="borderStyle">' +
                "solid" +
                "</ac:parameter>" +
                '<ac:parameter ac:name="linenumbers">' +
                "true" +
                "</ac:parameter>" +
                '<ac:parameter ac:name="collapse">' +
                "false" +
                "</ac:parameter>" +
                "<ac:plain-text-body>" +
                "<![CDATA[    More elaborate text `with other things like monospace`\n  ]]>" +
                "</ac:plain-text-body>" +
                "</ac:structured-macro>" +
                "\n" +
                "</ac:rich-text-body>" +
                "</ac:structured-macro>",
        );
    });

    it("converts <details> tags without summary to Confluence expand macro", () => {
        const input = `<details>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aliquam beatae culpa debitis deserunt dolor ea, exercitationem ipsa, magni maxime molestias nemo nostrum possimus quibusdam quo repudiandae sint veritatis voluptatibus.</details>`;
        expect(confluenceRenderer.html(input)).toBe(
            '<ac:structured-macro ac:name="expand">' +
                '<ac:parameter ac:name="title">' +
                "Click here to expand ..." +
                "</ac:parameter>" +
                "<ac:rich-text-body>" +
                "<p>" +
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aliquam beatae culpa debitis deserunt dolor ea, exercitationem ipsa, magni maxime molestias nemo nostrum possimus quibusdam quo repudiandae sint veritatis voluptatibus." +
                "</p>" +
                "\n" +
                "</ac:rich-text-body>" +
                "</ac:structured-macro>",
        );
    });

    it("renders normal html blocks without modification", () => {
        expect(confluenceRenderer.html('<div><p><img src="" alt=""></p></div>')).toBe(
            '<div><p><img src="" alt=""></p></div>',
        );
    });

    it("renders links to websites without modification", () => {
        expect(confluenceRenderer.link("http://example.com", "test", "nothing")).toBe(
            `<a href="http://example.com" title="test">nothing</a>`,
        );
    });

    it("renders links to websites and converts XML characters", () => {
        expect(confluenceRenderer.link("http://example.com?test=<>&'\"", "test", "nothing")).toBe(
            `<a href="http://example.com?test=&lt;&gt;&amp;&apos;&quot;" title="test">nothing</a>`,
        );
    });

    it("renders links to other matching markdown files as Confluence links", () => {
        expect(confluenceRenderer.link("./other.md", "", "")).toBe(
            `<a href="https://my-confluence.com/pages/viewpage.action?pageId=456"></a>`,
        );
    });

    it("renders links to other markdown files that don't match as file links", () => {
        expect(confluenceRenderer.link("./not-found.md", "", "")).toBe(`<a href="./not-found.md"></a>`);
    });

    it("renders links without href without modification", () => {
        expect(confluenceRenderer.link("", "", "")).toBe(`<a href=""></a>`);
    });
});
