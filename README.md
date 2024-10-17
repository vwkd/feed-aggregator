# README

JSON Feed aggregator using Deno KV



## Features

- cache items in Deno KV
- update existing items
- approximate published and modified date as current date
- expire items, e.g. feed of future events



## Usage

### Create feed

```js
import { FeedAggregator } from "@vwkd/feed-aggregator";

const kv = await Deno.openKv(":memory:");
const prefix = ["foo", "bar"];

const feed = new FeedAggregator(
  kv,
  prefix,
  {
    title: "Example Feed",
    home_page_url: "https://example.org",
    feed_url: "https://example.org/feed.json",
  },
);

await feed.add({
  item: {
    id: "1",
    content_html: "<p>foo</p>",
    url: "https://example.org/foo",
  },
});

await feed.add(...[
  {
    item: {
      id: "2",
      content_text: "bar",
      url: "https://example.org/bar",
    },
  },
  {
    item: {
      id: "3",
      content_html: "<p>foo</p>",
      content_text: "bar",
      url: "https://example.org/foobar",
    },
  },
]);

console.log(await feed.toJSON());
```

- add [`@deno/kv`](https://www.npmjs.com/package/@deno/kv) package for runtimes other than Deno

```js
import { openKv } from "@deno/kv";

const kv = await openKv(":memory:");
```

### Activate logging

- add [`@std/log`](https://jsr.io/@std/log) package
- set up `feed-aggregator` logger
- beware: must call `setup` before `FeedAggregator`!
- beware: see [`@std/log`](https://jsr.io/@std/log) for compatibility with runtimes other than Deno!

```js
import { ConsoleHandler, setup } from "@std/log";

setup({
  handlers: {
    console: new ConsoleHandler("INFO"),
  },
  loggers: {
    "feed-aggregator": {
      level: "INFO",
      handlers: ["console"],
    },
  },
});
```
