# Alan Interface Consumer

Library to build Alan interface consumers with Node.js.

## Install

`npm install @alan-platform/interface-consumer`

## Requirements
Code is generated with target `es2018` for Node.js v10 and higher.

## Versions
Major versions introduce breaking changes. Here is an overview of the changes between currently released major versions of the Alan Interface Consumer:

| Version | Alan interface | Connection method |
| ------- | -------------- | ----------------- |
| v7.x    | v20            | routed            |
| v6.x    | v18            | routed            |
| v5.x    | v14            | routed            |
| v4.x    | v12            | routed            |
| v3.x    | v11            | routed            |
| v2.x    | v2             | routed            |
| v1.x    | v2             | TCP/IP socket     |

Note: a routed interface connection uses a `socket-bridge` child process.
