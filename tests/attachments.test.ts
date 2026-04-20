import * as path from "path";
import signale from "signale";
import { extractAttachmentsFromPage, rewriteAttachmentFilenames } from "../src/UpdatePage";
import { Page } from "../src/types/Page";

describe("extractAttachmentsFromPage", () => {
    const pageData: Page = {
        pageId: "123",
        file: path.join(__dirname, "resources", "README.md"),
    };

    let errorSpy: jest.SpyInstance;
    beforeEach(() => {
        errorSpy = jest.spyOn(signale, "error").mockImplementation(() => undefined);
    });
    afterEach(() => {
        errorSpy.mockRestore();
    });

    it("finds <ri:attachment> references that resolve to existing files", () => {
        const content = `<ac:image><ri:attachment ri:filename="sample-attachment.png" /></ac:image>`;
        const attachments = extractAttachmentsFromPage(pageData, content);
        expect(attachments).toHaveLength(1);
        expect(attachments[0].originalPath).toBe("sample-attachment.png");
        expect(attachments[0].remoteFileName).toBe("sample-attachment.png");
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("logs an error and skips attachments whose files do not exist", () => {
        const content = `<ac:image><ri:attachment ri:filename="does-not-exist.png" /></ac:image>`;
        const attachments = extractAttachmentsFromPage(pageData, content);
        expect(attachments).toHaveLength(0);
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('"does-not-exist.png"'));
    });

    it("ignores <ri:attachment> literals inside CDATA sections (code blocks)", () => {
        const content =
            `<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[` +
            `return \`<ri:attachment ri:filename="\${href}" />\`;` +
            `]]></ac:plain-text-body></ac:structured-macro>`;
        const attachments = extractAttachmentsFromPage(pageData, content);
        expect(attachments).toHaveLength(0);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("finds real attachments alongside CDATA-wrapped literals", () => {
        const content =
            `<ac:image><ri:attachment ri:filename="sample-attachment.png" /></ac:image>` +
            `<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[` +
            `<ri:attachment ri:filename="\${href}" />` +
            `]]></ac:plain-text-body></ac:structured-macro>`;
        const attachments = extractAttachmentsFromPage(pageData, content);
        expect(attachments).toHaveLength(1);
        expect(attachments[0].originalPath).toBe("sample-attachment.png");
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("filters out http(s) attachment refs", () => {
        const content = `<ri:attachment ri:filename="http://example.com/foo.png" />`;
        const attachments = extractAttachmentsFromPage(pageData, content);
        expect(attachments).toHaveLength(0);
        expect(errorSpy).not.toHaveBeenCalled();
    });
});

describe("rewriteAttachmentFilenames", () => {
    it("replaces .. and / in filenames of real attachment tags", () => {
        const input = `<ri:attachment ri:filename="../images/foo.png" />`;
        expect(rewriteAttachmentFilenames(input)).toBe(`<ri:attachment ri:filename="__images_foo.png" />`);
    });

    it("leaves <ri:attachment> literals inside CDATA sections untouched", () => {
        const cdata = `<![CDATA[return \`<ri:attachment ri:filename="\${href}" />\`;]]>`;
        expect(rewriteAttachmentFilenames(cdata)).toBe(cdata);
    });

    it("rewrites real tags and preserves CDATA literals in the same document", () => {
        const input =
            `<ri:attachment ri:filename="../a/b.png" />` +
            `<![CDATA[<ri:attachment ri:filename="../not/rewritten.png" />]]>`;
        const expected =
            `<ri:attachment ri:filename="__a_b.png" />` +
            `<![CDATA[<ri:attachment ri:filename="../not/rewritten.png" />]]>`;
        expect(rewriteAttachmentFilenames(input)).toBe(expected);
    });
});
