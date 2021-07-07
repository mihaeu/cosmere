import * as fs from "fs";
import * as path from "path";

export default function(configPath: string | null) {
    fs.writeFileSync(
        configPath || path.join("cosmere.json")!,
        `{
  "baseUrl": "YOUR_BASE_URL",
  "user": "YOUR_USERNAME",
  "pass": "YOUR_PASSWORD",
  "cachePath": "build",
  "prefix": "This document is automatically generated. Please don't edit it directly!",
  "addToc": true,
  "tocOutline": false,
  "pages": [
    {
      "pageId": "1234567890",
      "file": "README.md",
      "title": "Optional title in the confluence page, remove to use # h1 from markdown file instead",
      "addToc": true,
      "tocOutline": false
    }
  ]
}
`,
    );
}
