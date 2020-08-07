# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.2] - 2020-07-07
### Fixed
- Upgrade dependencies in order to fix vulnerabilities

## [0.13.1] - 2020-07-06
### Fixed
- Moved jest and prettier to dev dependencies

## [0.13.0] - 2020-07-04
### Fixed
- Added retry for a weird confluence bug where the first attempt would result in a 501 response, and the second one works

## [0.12.3] - 2019-12-27
### Fixed
- Bug where error was thrown if not language was supplied for language block

## [0.12.2] - 2019-12-23
### Fixed
- Print proper URL after successful upload

## [0.12.1] - 2019-12-23
### Fixed
- Do not use newline for extracted title (fixes [#1](https://github.com/mihaeu/cosmere/issues/1))

## [0.12.0] - 2019-12-23
### Added
- Print link to confluence page after successful upload

### Fixed
- Set highlighting for known languages
- Use only first line of title
- Remote diff

## [0.11.0] - 2019-12-20
### Changed
- renaming to cosmere, all binaries, config entries etc. changed

# [0.10.0] - 2019-12-18
### Changed
- `pageTitle` config item is now optional if a level one header is found in the corresponding document. If neither is available an error is thrown.

## [0.9.0] - 2019-12-07
### Fixed
- Convert to storage representation directly instead of view to upload strings without encoding
- Always load markdown files relative to the config file

## [0.8.1] - 2019-12-03
### Fixed
- Attachment upload

## [0.8.0] - 2019-12-03
### Added
- This changelog file

### Changed
- Update remote version only if there's an actual change

### Fixed
- Attachment upload

## [0.7.0] - 2019-12-02
### Changed
- Add backward compatibility for node 8 (`fs.mkdir`)

[Unreleased]: https://github.com/mihaeu/cosmere/compare/0.13.1...HEAD
[0.13.1]: https://github.com/mihaeu/cosmere/compare/0.13.0...0.13.1
[0.13.0]: https://github.com/mihaeu/cosmere/compare/0.12.3...0.13.0
[0.12.3]: https://github.com/mihaeu/cosmere/compare/0.12.2...0.12.3
[0.12.2]: https://github.com/mihaeu/cosmere/compare/0.12.1...0.12.2
[0.12.1]: https://github.com/mihaeu/cosmere/compare/0.12.0...0.12.1
[0.12.0]: https://github.com/mihaeu/cosmere/compare/0.11.0...0.12.0
[0.11.0]: https://github.com/mihaeu/cosmere/compare/0.10.0...0.11.0
[0.10.0]: https://github.com/mihaeu/cosmere/compare/0.9.0...0.10.0
[0.9.0]: https://github.com/mihaeu/cosmere/compare/0.8.1...0.9.0
[0.8.1]: https://github.com/mihaeu/cosmere/compare/0.8.0...0.8.1
[0.8.0]: https://github.com/mihaeu/cosmere/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/mihaeu/cosmere/releases/tag/0.7.0
