'use strict';

var rp = require('request-promise');
var inquirer = require('inquirer');
var markdown2confluence = require('markdown2confluence');
var fsp = require('fs-promise');
var fs = require('fs');
var path = require('path');

var _require = require('winston'),
    createLogger = _require.createLogger,
    format = _require.format,
    transports = _require.transports;

// A preffer to use this instead console.log


var logger = createLogger({
  transports: [new transports.Console()],
  exitOnError: true,
  format: format.cli()
});
var prompts = [];
var user = process.env.MD2CUSER;
var pass = process.env.MD2CPASS;
var config = void 0;

/*
 * Let's read the config file
 */
try {
  config = JSON.parse(fs.readFileSync(path.join('.md2confluence-rc'), 'utf8'));
} catch (err) {
  if (err.code === 'ENOENT') {
    logger.error('File .md2confluence-rc not found!');
    process.exit(1);
  } else {
    throw err;
  }
}

if (user) {
  config.user = user;
}

if (pass) {
  config.pass = pass;
}

if (!config.user) {
  prompts.push({
    type: 'input',
    name: 'user',
    message: 'Your Confluence username:'
  });
}
if (!config.pass) {
  prompts.push({
    type: 'password',
    name: 'pass',
    message: 'Your Confluence password:'
  });
}

inquirer.prompt(prompts).then(function (_answers) {
  var answers = _answers;
  answers.user = config.user || answers.user;
  answers.pass = config.pass || answers.pass;

  // For any file in the .md2confluence-rc file...

  var _loop = function _loop(i) {
    var pageData = config.pages[i];

    logger.debug('Starting to render "' + pageData.mdfile + '"');

    // 1. Get the markdown file content
    fsp.readFile(pageData.mdfile, { encoding: 'utf8' }).then(function (fileData) {
      // 2. Transform the content to Markdown Wiki
      var mdWikiData = markdown2confluence(fileData);
      var currentPage = void 0;
      var newContent = void 0;

      var prefix = config.prefix || '';

      // Add the prefix (if defined) to the beginning of the wiki data
      if (prefix) {
        mdWikiData = '{info}' + prefix + '{info}\n\n' + mdWikiData;
      }

      // 3. Transform the Markdown Wiki to Storage (confluence scripting)
      return rp({
        method: 'POST',
        uri: config.baseUrl + '/contentbody/convert/storage',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          value: mdWikiData,
          representation: 'wiki'
        },
        auth: {
          user: answers.user,
          pass: answers.pass,
          sendImmediately: true
        },
        json: true // Automatically stringifies the body to JSON
      })
      // 4. Get current data of the confluence page
      .then(function (data) {
        newContent = data;

        return rp({
          method: 'GET',
          uri: config.baseUrl + '/content/' + pageData.pageid,
          body: {
            some: 'payload'
          },
          auth: {
            user: answers.user,
            pass: answers.pass,
            sendImmediately: true
          },
          json: true // Automatically stringifies the body to JSON
        });
      })

      // 5. Update the page in confluence
      .then(function (data) {
        currentPage = data;
        currentPage.title = pageData.title;
        currentPage.body = {
          storage: {
            value: newContent.value,
            representation: 'storage'
          }
        };
        currentPage.version.number = parseInt(currentPage.version.number, 10) + 1;

        return rp({
          method: 'PUT',
          uri: config.baseUrl + '/content/' + pageData.pageid,
          headers: {
            'Content-Type': 'application/json'
          },
          body: currentPage,
          auth: {
            user: answers.user,
            pass: answers.pass,
            sendImmediately: true
          },
          json: true // Automatically stringifies the body to JSON
        });
      })

      // everything is saved
      .then(function () {
        logger.info('"' + currentPage.title + '" saved in confluence.');
      });
    }).catch(function (err) {
      logger.error(err);
    });
  };

  for (var i = 0; i < config.pages.length; i += 1) {
    _loop(i);
  }
});