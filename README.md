# markdown-to-confluence

Update confluence pages from your markdown files (like a README.md)

## Usage

### Install the package

You can safely install it as a global package:

```bash
npm install -g markdown-to-confluence-converter
```
This will allow you to use the command `md2c` anywhere.

But, it's intended to development environments and I recommend to install it as dev dependency:

```bash
npm install --save-dev markdown-to-confluence-converter
```

...and excecuting it as a npm script.

### Create the `markdown-to-confluence.json` file

It's mandatory. It looks like:

```bash
md2c generate-config [--config=<path>]
```

### Use Environmental Variables to store username and password

If you wish to not use the config file to store your username and password, you may also use your Environmental Variables to do so. The name of the environmental variables must be as below:

```
CONFLUENCE_USER=YOUR_USERNAME
CONFLUENCE_PASSWORD=YOUR_PASSWORD

# or

 CONFLUENCE_USER=YOUR_USERNAME CONFLUENCE_PASSWORD=YOUR_PASSWORD markdown-to-confluence
```

### Excecute as a node app

You can use the command in the working directory (if it was installed globally):

```bash
md2c --help
```

Or execute it from your node_modules in your working directory (installed locally):

```bash
node_modules/.bin/md2c
```

Or you can add this like a npm script in your package.json (recommended if it was installed as devDependencies):

```javascript
{
  ...
  "scripts": {
    "pushdoc": "md2c"
  },
  ...
}
```

## Troubleshooting

### Custom certificates on Confluence instance

Prepend `NODE_TLS_REJECT_UNAUTHORIZED=0` to your `md2c` call in order to not reject invalid certificates. This is risky and it's preferable to get proper certificates.

## Need new features?

Please, feel free to create any issues and pull request that you need.
