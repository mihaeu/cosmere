# md2confluence
Update confluence pages from your markdown files (like a README.md)

## HowTo use it

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

__baseUrl__:
it's the atlassian API url of confluence.

__user__ (OPTIONAL):
Your confluence username. If you don't set any it will be prompt it.

__pass__ (OPTIONAL):
Your confluence password. If you don't set any it will be prompt it.

__pages__:
A list of objects with the pages do you want to Update.

__pages[*].pageid__:
The page ID of confluence.
You can see it as a URL Param when you edit your page in confluence.

__pages[*].mdfile__:
The path to the file in Markdown format with the content to update the page.
It's relative to the dir where you run the command.

__pages[*].mdfile__ (OPTIONAL):
The path to the file in Markdown format with the content to update the page.
It's relative to the dir where you run the command.


### Excecute as a node app

You can use the command in the working directory (if it was installed globally):

```bash
md2confluence
```

Or exceute it from your node_modules in your working directory (installed locally):

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
