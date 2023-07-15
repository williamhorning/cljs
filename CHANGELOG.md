# Cloudlink changelog

This changelog doesn't include changes to versions of Cloudlink published under the `@wgyt/cloudlink` package that was used for all versions prior to 4.0.0.

## 4.1.1

- Support Node.js without requiring monkeypatching `globalThis`
- Reexport default as CloudlinkClient

## 4.1.0

- Fix `CloudlinkClient#on` not giving data
- Fix inability to check if socket is open

## 4.0.0

- Support Cloudlink 4
- Add `CloudlinkClient#connect` and `CloudlinkClient#disconnect`
- Add `CloudlinkClient#motd`, `CloudlinkClient#ulist`, `CloudlinkClient#server_ver`
- Handle new ulist events while supporting the old array-based ulist
