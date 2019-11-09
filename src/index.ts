// import axios from 'axios';
import * as fs from "fs";

const axios = require("axios");
const inquirer = require("inquirer");
const markdown2confluence = require("markdown2confluence");
const path = require("path");
const { createLogger, format, transports } = require("winston");

// A preffer to use this instead console.log
const logger = createLogger({
  transports: [new transports.Console()],
  exitOnError: true,
  format: format.cli()
});

type Page = {
  pageid: string;
  mdfile: string;
  title: string;
};
type Config = {
  baseUrl: string;
  user?: string;
  pass?: string;
  prefix: string;
  pages: Page[];
};

function readConfigFromFile(): Config {
  const configPath = path.join(".md2confluence-rc");
  if (!fs.existsSync(configPath)) {
    logger.error("File .md2confluence-rc not found!");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8")) as Config;
}

function overwriteAuthFromConfigWithEnvIfPresent(config: Config): Config {
  config.user = process.env.MD2CUSER || config.user;
  config.pass = process.env.MD2CPASS || config.pass;
  return config;
}

async function promptUserAndPassIfNotSet(config: Config): Promise<Config> {
  const prompts = [];
  if (!config.user) {
    prompts.push({
      type: "input",
      name: "user",
      message: "Your Confluence username:"
    });
  }

  if (!config.pass) {
    prompts.push({
      type: "password",
      name: "pass",
      message: "Your Confluence password:"
    });
  }

  const answers = await inquirer.prompt(prompts);
  config.user = config.user || answers.user;
  config.pass = config.pass || answers.pass;

  return config;
}

async function updatePage(pageData: Page, config: Config) {
  logger.debug(`Starting to render "${pageData.mdfile}"`);

  const fileData = fs.readFileSync(pageData.mdfile, { encoding: "utf8" });
  let mdWikiData = markdown2confluence(fileData);

  const prefix = config.prefix || "";

  // Add the prefix (if defined) to the beginning of the wiki data
  if (prefix) {
    mdWikiData = `{info}${prefix}{info}\n\n${mdWikiData}`;
  }

  const dir = "./tmp";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const tempFile = `${dir}/${pageData.pageid}`;

  // let needsContentUpdate = true;
  // if (fs.existsSync(tempFile)) {
  //   const fileContent = fs.readFileSync(tempFile, "utf-8");
  //
  //   if (fileContent === mdWikiData) {
  //     needsContentUpdate = false;
  //   }
  // }
  // if (!needsContentUpdate) {
  //   logger.info(`No content update necessary for "${pageData.mdfile}"`);
  //   return;
  // }

  fs.writeFileSync(tempFile, mdWikiData, "utf-8");

  const auth = {
    auth: {
      username: config.user,
      password: config.pass,
    }
  };

  const newContent = await axios.post(
    `${config.baseUrl}/contentbody/convert/storage`,
    {
      value: mdWikiData,
      representation: "wiki"
    },
    {
      headers: {
        "Content-Type": "application/json"
      },
      ...auth,
    }
  );
  const currentPage = (await axios.get(`${config.baseUrl}/content/${pageData.pageid}`, auth)).data;

  currentPage.title = pageData.title;
  currentPage.body = {
    storage: {
      value: newContent.data.value,
      representation: "storage"
    }
  };
  currentPage.version.number = parseInt(currentPage.version.number, 10) + 1;

  await axios.put(`${config.baseUrl}/content/${pageData.pageid}`, currentPage, {
    headers: {
      "Content-Type": "application/json"
    },
    ...auth,
  });

  logger.info(`"${currentPage.title}" saved in confluence.`);
}

export async function md2confluence() {
  let config: Config = await promptUserAndPassIfNotSet(
    overwriteAuthFromConfigWithEnvIfPresent(readConfigFromFile())
  );

  config.pages.forEach(pageData => updatePage(pageData, config));
}
