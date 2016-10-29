# md2confluence
Update confluence pages from your markdown files (like a README.md)

## HowTo use it

### Install the package

Although you can use this package like any other package, it's intended to development environments and I recommend to install it as dev dependency:

```bash
npm install --save-dev md2confluence
```

### Create the .md2confluence-rc file

It's mandatory. It looks like:
```javascript
{
  "baseUrl": "https://my.atlassian.net/wiki/rest/api",
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


## Need new features?

Please, feel free to create any issues and pull request that you need.
