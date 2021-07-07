import { addToc, shouldActivateTocOutline, shouldAddToc, updatePage } from "../src/UpdatePage";
import { ConfluenceAPI } from "../src/api/ConfluenceAPI";
import { Page } from "../src/types/Page";
import { Config } from "../src/types/Config";

describe("UpdatePage", () => {
  it.skip("fails", () => {
    const pageData: Page = {
      pageId: "123456789",
      file: "/dev/null",
    };
    const config: Config = {
      baseUrl: "string",
      cachePath: "string",
      prefix: "string",
      pages: [],
      configPath: null,
    };
    expect(updatePage(new ConfluenceAPI("", "", ""), pageData, config, false)).toBeFalsy();
  });
  describe("TOC", () => {
    it("should render TOC with outline", () => {
      const pageData: Page = {
        pageId: "123456789",
        file: "/dev/null",
      };
      const config: Config = {
        baseUrl: "string",
        cachePath: "string",
        prefix: "string",
        pages: [],
        configPath: null,
        addToc: true,
        tocOutline: true,
      };
      const result = addToc(config, pageData, "");
      expect(result).toContain("ac:structured-macro ac:name=\"toc\"");
      expect(result).toContain("<ac:parameter ac:name=\"outline\">true</ac:parameter>");
    });

    describe("enable disable toc", () => {
      it("should not render TOC when flag are undefined", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
        };
        expect(shouldAddToc(config, pageData)).toEqual(false);
      });
      it("should not render TOC when flag are false", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
          addToc: false,
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          addToc: false,
        };
        expect(shouldAddToc(config, pageData)).toEqual(false);
      });
      it("should render TOC when config flag is true", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          addToc: true,
        };
        expect(shouldAddToc(config, pageData)).toEqual(true);
      });
      it("should render TOC when config flag is false but page flag is true", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
          addToc: true,
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          addToc: false,
        };
        expect(shouldAddToc(config, pageData)).toEqual(true);
      });
      it("should not render TOC when config flag is true but page flag is false", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
          addToc: false,
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          addToc: true,
        };
        expect(shouldAddToc(config, pageData)).toEqual(false);
      });
    });
    describe("enable disable outline", () => {
      it("should disable outline when flag are undefined", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
        };
        expect(shouldActivateTocOutline(config, pageData)).toEqual(false);
      });
      it("should disable outline when flag are false", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
          tocOutline: false,
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          tocOutline: false,
        };
        expect(shouldActivateTocOutline(config, pageData)).toEqual(false);
      });
      it("should enable outline when config flag is true", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          tocOutline: true,
        };
        expect(shouldActivateTocOutline(config, pageData)).toEqual(true);
      });
      it("should enable outline when config flag is false but page flag is true", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
          tocOutline: true,
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          tocOutline: false,
        };
        expect(shouldActivateTocOutline(config, pageData)).toEqual(true);
      });
      it("should disable outline when config flag is true but page flag is false", () => {
        const pageData: Page = {
          pageId: "123456789",
          file: "/dev/null",
          tocOutline: false,
        };
        const config: Config = {
          baseUrl: "string",
          cachePath: "string",
          prefix: "string",
          pages: [],
          configPath: null,
          tocOutline: true,
        };
        expect(shouldActivateTocOutline(config, pageData)).toEqual(false);
      });
    });
  });
});
