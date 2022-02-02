import GenerateCommand from "../../src/cli/GenerateCommand";
import * as os from "os";
import * as fs from "fs";

describe("GenerateCommand", () => {
    it("fails", () => {
        const path = os.tmpdir() + "/cosmere.json";
        GenerateCommand(path);
        expect(fs.readFileSync(path, "utf8")).toBe(`{
  "baseUrl": "<your base URL>",
  "user": "<your username>",
  "pass": "<your password>",
  "personalAccessToken": "<your personal access token (can be set instead of username/password)>",
  "cachePath": "build",
  "prefix": "This document is automatically generated. Please don't edit it directly!",
  "pages": [
    {
      "pageId": "1234567890",
      "file": "README.md",
      "title": "Optional title in the confluence page, remove to use # h1 from markdown file instead"
    }
  ]
}
`);
    });
});
