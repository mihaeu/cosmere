const rp = require('request-promise');
const inquirer = require('inquirer');
const markdown2confluence = require('markdown2confluence');
const fsp = require('fs-promise');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
  ],
  exitOnError: true,
});

// const npmPackage = JSON.parse(fs.readFileSync(path.join('package.json'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join('.md2confluence-rc'), 'utf8'));
const prompts = [];

if (!config.user) {
  prompts.push({
    type: 'input',
    name: 'user',
    message: 'Your Confluence username:',
  });
}

if (!config.pass) {
  prompts.push({
    type: 'password',
    name: 'pass',
    message: 'Your Confluence password:',
  });
}

inquirer.prompt(prompts).then((_answers) => {
  const answers = _answers;
  answers.user = config.user || answers.user;
  answers.pass = config.pass || answers.pass;

  for (let i = 0; i < config.pages.length; i += 1) {
    const pageData = config.pages[i];

    fsp.readFile(pageData.mdfile, { encoding: 'utf8' })
      .then((fileData) => {
        const mdWikiData = markdown2confluence(fileData);
        let currentPage;
        let newContent;

        // Transform the Markdown Wiki to Storage
        return rp({
          method: 'POST',
          uri: `${config.baseUrl}/contentbody/convert/storage`,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            value: mdWikiData,
            representation: 'wiki',
          },
          auth: {
            user: answers.user,
            pass: answers.pass,
            sendImmediately: true,
          },
          json: true, // Automatically stringifies the body to JSON
        })

        // Get current data of the confluence page
        .then((data) => {
          newContent = data;

          return rp({
            method: 'GET',
            uri: `${config.baseUrl}/content/${pageData.pageid}`,
            body: {
              some: 'payload',
            },
            auth: {
              user: answers.user,
              pass: answers.pass,
              sendImmediately: true,
            },
            json: true, // Automatically stringifies the body to JSON
          });
        })

        // Actualiza la página
        .then((data) => {
          currentPage = data;

          currentPage.title = pageData.title; // || npmPackage.name;
          currentPage.body = {
            storage: {
              value: newContent.value,
              representation: 'storage',
            },
          };
          currentPage.version.number = parseInt(currentPage.version.number, 10) + 1;

          return rp({
            method: 'PUT',
            uri: `${config.baseUrl}/content/${pageData.pageid}`,
            headers: {
              'Content-Type': 'application/json',
            },
            body: currentPage,
            auth: {
              user: answers.user,
              pass: answers.pass,
              sendImmediately: true,
            },
            json: true, // Automatically stringifies the body to JSON
          });
        })

        // everything is saved
        .then((/* data */) => {
          // maybe show a message of success...
          logger.info(`"${currentPage.title}" saved in confluence.`);
        });
      })
      .catch((err) => {
        logger.error(err);
      });
  }
});
