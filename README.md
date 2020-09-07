# Alan Interface Consumer

Library to build Alan interface consumers with Node.js.

## Install

`npm install @alan-platform/interface-consumer`

## Build Status

[![Build Status](https://travis-ci.org/alan-platform/InterfaceConsumer.svg?branch=master)](https://travis-ci.org/alan-platform/InterfaceConsumer)

## Versions
Major versions introduce breaking changes. Here is an overview of the changes between currently released major versions of the Alan Interface Consumer:

| Version | Alan interface | Node.js | Connection method |
| ------- | -------------- | ------- | ----------------- |
| v4.x    | v12            | v12.x   | routed            |
| v3.x    | v11            | v12.x   | routed            |
| v2.x    | v2             | v10.x   | routed            |
| v1.x    | v2             | v10.x   | TCP/IP socket     |

Note: a routed interface connection uses a `socket-bridge` child process.
