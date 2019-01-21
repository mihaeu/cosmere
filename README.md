# md2confluence
Update confluence pages from your markdown files (like a README.md)

## How to use it

### Install the package

You can safely install it as a global package:

```bash
npm install -g md2confluence
```
This will allow you to use the command ```md2confluence``` anywhere.

But, it's intended to development environments and I recommend to install it as dev dependency:

```bash
npm install --save-dev md2confluence
```

...and excecuting it as a npm script.

### Create the .md2confluence-rc file

It's mandatory. It looks like:
```javascript
{
  "baseUrl": "https://my.atlassian.net/wiki/rest/api",
  "user": "my-user (Optional)",
  "pass": "my-password (Optional)",
  "prefix": "This document is automatically generated. Please don't edit it directly!",
  "pages": [
    {
      "pageid": "37748761",
      "mdfile": "README.md",
      "title": "Optional title in the confluence page"
    },
    ...
  ]
}
```

**Basic Settings**

| Key | Description |
| --- | --- |
| baseUrl | the Atlassian API url of confluence |
| user | your confluence username. If you don't set any it will be prompt it |
| pass | your confluence password. If you don't set any it will be prompt it |
| prefix | OPTIONAL - a general information that is included at the top of the confluence page |
| pages | a list of objects with the pages do you want to update |

Each page object can define the following key value pairs.

**Page Settings**

| Key | Description |
| --- | --- |
| pageid | the page ID of the confluence page to update ([How to get Confluence page ID](https://confluence.atlassian.com/confkb/how-to-get-confluence-page-id-648380445.html)) |
| mdfile | The path to the file in Markdown format with the content to update the page. It's relative to the dir where you run the command. |
| title | the page title, if skipped the already defined page title will be kept.

### Use Environmental Variables to store username and password

If you wish to not use the config file to store your username and password, you may also use your Environmental Variables to do so. The name of the environmental variables must be as below:

```
Username = $MD2CUSER
Password = $MD2CPASS
```


### Excecute as a node app

You can use the command in the working directory (if it was installed globally):

```bash
md2confluence
```

Or execute it from your node_modules in your working directory (installed locally):

```bash
node_modules/.bin/md2confluence
```

Or you can add this like a npm script in your package.json (recommended if it was installed as devDependencies):

```javascript
{
  ...
  "scripts": {
    "pushdoc": "md2confluence"
  },
  ...
}
```


## Need new features?

Please, feel free to create any issues and pull request that you need.
