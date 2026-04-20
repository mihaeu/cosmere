# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn build` — compile TypeScript to `dist/` (tsc). Required before running the CLI, since `bin/cosmere` loads `../dist/src/cli/MainCommand`.
- `yarn watch` (or `yarn start`) — tsc in watch mode.
- `yarn test` — run Jest. Config is inline in `package.json` (uses `@swc/jest`, matches `tests/**/*.test.ts`, collects coverage from all `.ts`).
- Run a single test: `yarn jest tests/UpdatePage.test.ts` or `yarn jest -t "test name substring"`.
- `yarn fix` — prettier over `**/*.{ts,md,json}` (4-space tabs, trailing commas, 120 col).
- Release: `yarn release` (tsc + `np --help`), then `yarn np <major|minor|patch>`.
- Local CLI after build: `node bin/cosmere --help` (or `yarn cosmere` when linked).

## Architecture

Cosmere has **two entry points that share the same core pipeline** but differ in how they load config:

- **CLI** (`bin/cosmere` → `src/cli/MainCommand.ts`) uses `FileConfigLoader` to read `cosmere.json`, fall back to `CONFLUENCE_*` env vars, then interactively prompt (via `inquirer`) for any missing credentials.
- **Library** (`src/lib/index.ts`, published entry for `import cosmere from "cosmere/dist/src/lib"`) uses `ObjectConfigLoader`, which takes a fully-formed config object and throws if credentials are missing — no prompting, no env var fallback.

Both loaders converge on a `Config` (`src/types/Config.ts`) consumed by `updatePage` in `src/UpdatePage.ts`, which is the single place all sync logic lives.

### Authorization token construction

Both loaders delegate to `createAuthorizationToken` in `src/auth/createAuthorizationToken.ts`:

- `personalAccessToken` → `Bearer <PAT>` (Data Center / Server PATs; Cloud does not accept these).
- `user` + `pass` → `Basic <base64(user:pass)>` (covers both DC password login and Cloud email + API token — the wire format is identical).
- Neither → returns `null`; callers emit a fatal error (CLI) or throw (library).

If you touch auth, update the shared helper rather than either loader in isolation.

### `updatePage` pipeline (src/UpdatePage.ts)

For each configured page:

1. **Render**: `convertToWikiFormat` reads the markdown, extracts an H1 title if `pageData.title` is unset, and runs `marked` with either `ConfluenceRenderer` or a user-supplied `config.customRenderer`. Output is Confluence **storage format** XHTML (`<ac:*>`, `<ri:*>` macros), not wiki markup.
2. **Prefix**: optional info macro prepended via `addPrefix`.
3. **Local cache short-circuit**: output is byte-compared against `<cachePath>/<pageId>`. On match (and `!force`), skip entirely — no HTTP calls.
4. **Attachment sync** (`updateAttachments`): scan rendered HTML for `<ri:attachment ri:filename="…"/>`, resolve local files relative to the markdown file, map to remote attachments by title+fileSize, delete stale remotes, upload new ones. Then rewrite attachment filenames in the HTML (replacing `..` and `/` with `_`) so they match the remote names.
5. **Remote diff**: fetch current page, compare bodies after `removeDynamicIds` strips `ac:macro-id`/`id` attributes (Confluence regenerates these on every save, so naive equality always reports dirty). Skip PUT if unchanged.
6. **PUT**: bump `version.number` and `updateConfluencePage`. `ConfluenceAPI.updateConfluencePage` retries once on failure.

When modifying rendering or comparison logic, keep the local-cache and remote-diff paths in sync — `mdWikiData` written to the cache file must be the same string sent to Confluence, or the cache will constantly invalidate.

### `ConfluenceRenderer` (src/ConfluenceRenderer.ts)

Extends `marked.Renderer`. Overrides emit Confluence storage-format macros:

- `code` → `ac:structured-macro name="code"` with a lang allow-list (`langMap`); unknown langs fall back to `none`.
- `image` → `ac:image` with `ri:url` for `http…` hrefs, `ri:attachment` otherwise.
- `link` → resolves relative links that point to another configured page's `file` and rewrites them to `pages/viewpage.action?pageId=…`.
- `html` → detects `<details>/<summary>` blocks and re-renders them as `expand` macros (recursively constructs a new `ConfluenceRenderer` for the inner content).

This class is the public subclassing surface documented in the README — users pass their own subclass as `customRenderer` in the object config. Don't break its constructor signature `(options, config, page)` without a major version bump.

## Testing notes

Tests live in `tests/` mirroring `src/`. `tests/helper/data.ts` holds shared fixtures, `tests/resources/` holds sample markdown/images. `ConfluenceAPI` and `inquirer` are mocked in the command tests; `UpdatePage.test.ts` drives the pipeline against a mocked API.
