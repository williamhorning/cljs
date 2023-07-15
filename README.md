![Cloudlink.js - A Cloudlink client written in Typescript](./logo.svg)

# Cloudlink.JS

A Cloudlink client written in Typescript.

## Installation

Install `@williamhorning/cloudlink` using your favourite package manager or import it from a CDN.

## Usage

```ts
import CloudlinkClient from "@williamhorning/cloudlink"; // or "https://deno.land/x/cloudlink@4.1.1/src/index.ts";

// setup a new client
let cloudlink = new CloudlinkClient({
  url: "wss://cloudlink.example.com",
  log: false,
});

// listen for packets
cloudlink.on("packet", (packet) => {
  console.log("Received packet:", packet);
});

// send a packet
await cloudlink.send({
  cmd: "gmsg",
  val: "Hello, world!",
});

// close the connection
await cloudlink.disconnect();

// reconnect
await cloudlink.connect();
```
