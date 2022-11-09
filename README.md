# Cosmere

Sync your markdown files to confluence.

## Features

-   upload new versions only when necessary
-   upload/delete local images as attachments
-   supports the original markdown spec and parts from [CommonMark](https://marked.js.org/#specifications) and [GitHub Flavored Markdown](https://marked.js.org/#specifications)
-   can be used as a CLI command or in a script

## Usage

### Global Installation

```bash
npm install -g cosmere

# or

yarn global add cosmere
```

### Library

```bash
npm install --save-dev cosmere

# or

yarn add --dev cosmere
```

### Configuration

To get started generate configuration using

```bash
cosmere generate-config [--config=<path>]
```

which produces:

```json
{
    "baseUrl": "<your base url including /rest/api>",
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
```

### Continuous Integration

In most scenarios it is not recommended storing your credentials in the configuration file, because you will probably add it to your VCS. Instead, it is recommended to provide the following environment variables in your build pipeline (GitLab CI, GitHub Actions, Jenkins, ...):

```ini
CONFLUENCE_USERNAME=YOUR_USERNAME
CONFLUENCE_PASSWORD=YOUR_PASSWORD
```

or

```ini
CONFLUENCE_PERSONAL_ACCESS_TOKEN="<your auth token>"
```

or add it in front of the command when executing locally (add a space in front of the command when using bash in order to not write the credentials to the bash history):

```bash
 CONFLUENCE_USER=YOUR_USERNAME CONFLUENCE_PASSWORD=YOUR_PASSWORD cosmere
 # or
 CONFLUENCE_PERSONAL_ACCESS_TOKEN="<your personal access token>" cosmere
```

### Run

```bash
# global installation
cosmere --help

# local installation with yarn
yarn cosmere --hhelp

# local installation with npm
npm run cosmere --help

# or plain
node_modules/.bin/cosmere --help
```

or create an alias:

```json
{
    "scripts": {
        "pushdoc": "cosmere"
    }
}
```

## Using Cosmere as a library

```js
import cosmere from "cosmere/dist/src/lib";
import ConfluenceRenderer from "cosmere/dist/src/ConfluenceRenderer";

class CustomRenderer extends ConfluenceRenderer {

   constructor(options, config, page) {
      super(options, config, page);
   }

   image(href, title, text) {
      if (href.startsWith("http")) {
         return `<ac:image ac:width="768px" ac:height="768px"><ri:url ri:value="${href}" /></ac:image>`;
      }
      return `<ac:image ac:width="768px" ac:height="768px"><ri:attachment ri:filename="${href}" /></ac:image>`;
   }
}

const config = {
    baseUrl: "<your base url including /rest/api>",
    user: "<your username>",
    pass: "<your password>",
    cachePath: "build",
    prefix: "This document is automatically generated. Please don't edit it directly!",
    insecure: false,
    force: false,
    fileRoot: "/usr/bin/myawesomefolder",
    pages: [
        {
            pageId: "1234567890",
            file: "README.md", // this path will be evaluated as fileRoot + file
            title: "Optional title in the confluence page, remove to use # h1 from markdown file instead",
        },
    ],
    customRenderer: CustomRenderer,
};

await cosmere(config);
```

## Troubleshooting

### Custom certificates on Confluence instance

Use the `--insecure` option for your `cosmere` call in order to not reject invalid certificates. This is risky, and it's preferable to get proper certificates.

## Need new features?

Please, feel free to create any issues and pull request that you need.

## Release

1. Add feature/fix bugs etc.
2. Document changes in [`CHANGELOG.md`](CHANGELOG.md) (with the new [version](https://semver.org/))
3. Commit everything
4. Push/merge to main
5. Run
    ```bash
    yarn release
    yarn np <major|minor|patch>
    ```

## History

### md2confluence

I had various scripts that stitched markdown files together and uploaded them. I forked [`md2confluence`](https://github.com/jormar/md2confluence) by [Jormar Arellano](https://github.com/jormar) and started playing around with that, but quickly noticed that many markdown files broke due to the conversion process (wiki -> storage instead of directly to storage).

### Cosmere

The project diverged from its original intent and so I decided to rename it. [Cosmere](https://coppermind.net/wiki/Cosmere) is the wonderful universe of various books written by [Brandon Sanderson](https://www.brandonsanderson.com/). If you are into fantasy I strongly recommend checking him out.

## License

See [LICENSE](LICENSE).
