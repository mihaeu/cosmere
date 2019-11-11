import * as fs from "fs";

const axios = require("axios");
const axiosFile = require("axios-file");
const inquirer = require("inquirer");
const markdown2confluence = require("markdown2confluence");
const path = require("path");

type Page = {
  pageId: string;
  file: string;
  title: string;
};
type Config = {
  baseUrl: string;
  user?: string;
  pass?: string;
  prefix: string;
  pages: Page[];
};
type AuthHeaders = {
  auth: {
    username: string,
    password: string,
  }
};

function readConfigFromFile(configPath: string|null): Config {
  configPath = configPath || path.join("markdown-to-confluence.json");
  if (!fs.existsSync(configPath!)) {
    console.error("File markdown-to-confluence.json not found!");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(configPath!, "utf8")) as Config;
}

function overwriteAuthFromConfigWithEnvIfPresent(config: Config): Config {
  config.user = process.env.CONFLUENCE_USERNAME || config.user;
  config.pass = process.env.CONFLUENCE_PASSWORD || config.pass;
  return config;
}

async function promptUserAndPassIfNotSet(config: Config): Promise<Config> {
  const prompts = [];
  if (!config.user) {
    prompts.push({
      type: "input",
      name: "user",
      message: "Your Confluence username:",
    });
  }

  if (!config.pass) {
    prompts.push({
      type: "password",
      name: "pass",
      message: "Your Confluence password:",
    });
  }

  const answers = await inquirer.prompt(prompts);
  config.user = config.user || answers.user;
  config.pass = config.pass || answers.pass;

  return config;
}

async function convertToWikiFormat(config: Config, mdWikiData: string, auth: AuthHeaders) {
  const newContent = await axios.post(
    `${config.baseUrl}/contentbody/convert/storage`,
    {
      value: mdWikiData,
      representation: "wiki",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      ...auth,
    },
  );
  return newContent;
}

async function updateConfluencePage(currentPage: any, pageData: Page, newContent: any, config: Config, auth: AuthHeaders) {
  currentPage.title = pageData.title;
  currentPage.body = {
    storage: {
      value: newContent.data.value,
      representation: "storage",
    },
  };
  currentPage.version.number = parseInt(currentPage.version.number, 10) + 1;

  await axios.put(`${config.baseUrl}/content/${pageData.pageId}`, currentPage, {
    headers: {
      "Content-Type": "application/json",
    },
    ...auth,
  });
}

async function deleteAttachments(pageData: Page, config: Config, auth: AuthHeaders) {
  const attachments = await axios.get(`${config.baseUrl}/content/${pageData.pageId}/child/attachment`, auth);
  attachments.data.results.forEach((attachment: any) => axios.delete(`https://confluence.tngtech.com/rest/api/content/${attachment.id}`, auth));
}

async function updatePage(pageData: Page, config: Config, force: boolean) {
  console.debug(`Starting to render "${pageData.file}"`);

  let fileData = fs.readFileSync(pageData.file, { encoding: "utf8" });
  let mdWikiData = markdown2confluence(fileData);

  const prefix = config.prefix;

  if (prefix) {
    mdWikiData = `{info}${prefix}{info}\n\n${mdWikiData}`;
  }

  const dir = "./tmp";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const tempFile = `${dir}/${pageData.pageId}`;

  let needsContentUpdate = true;
  if (fs.existsSync(tempFile)) {
    const fileContent = fs.readFileSync(tempFile, "utf-8");

    if (fileContent === mdWikiData) {
      needsContentUpdate = false;
    }
  }
  if (!force && !needsContentUpdate) {
    console.info(`No content update necessary for "${pageData.file}"`);
    return;
  }

  const auth = {
    auth: {
      username: config.user!,
      password: config.pass!,
    },
  };

  const newContent = await convertToWikiFormat(config, mdWikiData, auth);
  newContent.data.value = newContent.data.value.replace(
    /<ac:structured-macro ac:name="code"[\s\S]+?<ac:plain-text-body>([\s\S]+?)<\/ac:plain-text-body><\/ac:structured-macro>/,
    '<ac:structured-macro ac:name="plantuml" ac:schema-version="1"><ac:parameter ac:name="atlassian-macro-output-type">INLINE</ac:parameter><ac:plain-text-body>$1</ac:plain-text-body></ac:structured-macro>',
  );

  await deleteAttachments(pageData, config, auth);
  newContent.data.value.match(/<ri:attachment ri:filename="(.+?)" *\/>/g)
    .map((s: string) => s.replace(/.*"(.+)".*/, '$1'))
    .filter((filename: string) => fs.existsSync(filename))
    .forEach(async (filename: string) => {
      const newFilename = __dirname + '/../tmp/' + filename.replace('/..', '_').replace('/', '_');
      fs.copyFileSync(__dirname + '/../' + filename, newFilename);
      await uploadAttachment(newFilename, pageData, config, auth)
    });
  newContent.data.value = newContent.data.value.replace(/<ri:attachment ri:filename=".+?"/g, (s: string) => s.replace('/', '_'));

  const currentPage = (await axios.get(`${config.baseUrl}/content/${pageData.pageId}`, auth)).data;
  await updateConfluencePage(currentPage, pageData, newContent, config, auth);

  fs.writeFileSync(tempFile, mdWikiData, "utf-8");
  console.info(`"${currentPage.title}" saved in confluence.`);
}

async function uploadAttachment(filename: string, pageData: Page, config: Config, auth: AuthHeaders) {
  await axiosFile({
    url: `${config.baseUrl}/content/${pageData.pageId}/child/attachment`,
    method: 'post',
    headers: {
      'X-Atlassian-Token': 'nocheck',
    },
    data: {
      file: fs.createReadStream(filename)
    },
    ...auth,
  });
}

export async function md2confluence(configPath: string|null, force: boolean = false) {
  let config: Config = await promptUserAndPassIfNotSet(overwriteAuthFromConfigWithEnvIfPresent(readConfigFromFile(configPath)));

  config.pages.forEach(pageData => updatePage(pageData, config, force));
}

export function generateConfig(configPath: string|null) {
  configPath = configPath || path.join("markdown-to-confluence.json");
  fs.writeFileSync(configPath!, `{
  "baseUrl": "YOUR_BASE_URL",
  "user": "YOUR_USERNAME",
  "pass": "YOUR_PASSWORD",
  "prefix": "This document is automatically generated. Please don't edit it directly!",
  "pages": [
    {
      "pageId": "1234567890",
      "file": "README.md",
      "title": "Optional title in the confluence page"
    }
  ]
}
`);
}
