# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/mihaeu/md2confluence/compare/0.9.0...HEAD
[0.8.1]: https://github.com/mihaeu/md2confluence/compare/0.8.1...0.9.0
[0.8.1]: https://github.com/mihaeu/md2confluence/compare/0.8.0...0.8.1
[0.8.0]: https://github.com/mihaeu/md2confluence/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/mihaeu/md2confluence/releases/tag/0.7.0