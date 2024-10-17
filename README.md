# README

JSON Feed aggregator



## Features

- stateful JSON feed
- cache items using Deno KV
- update existing items
- approximate published and modified date as current date
- expire items, e.g. feed of future events



## Usage

### Create feed

```js
import { FeedAggregator } from "@vwkd/feed-aggregator";

const kv = await Deno.openKv(":memory:");
const prefix = ["my", "example", "feed"];

const feed = new FeedAggregator(
  kv,
  prefix,
  {
    title: "My Example Feed",
    home_page_url: "https://example.org",
    feed_url: "https://example.org/feed.json",
  },
);

await feed.add({
  item: {
    id: "1",
    content_html: "<p>Hello, world!</p>",
    url: "https://example.org/initial-post",
  },
});

await feed.add(
  {
    item: {
      id: "2",
      content_text: "This is a second item.",
      url: "https://example.org/second-item",
    },
  },
  {
    item: {
      id: "3",
      content_html: "<p>This is a third item.</p>",
      content_text: "This is a third item.",
      url: "https://example.org/third-item",
    },
  },
);

const json = await feed.toJSON();
```

- add [`@deno/kv`](https://www.npmjs.com/package/@deno/kv) package for runtimes other than Deno

```js
import { openKv } from "@deno/kv";

const kv = await openKv(":memory:");
```

### Activate logging

```js
import { logger } from "@vwkd/feed-aggregator";

logger.setLevel("debug");
// logger.setLevel("silent");
```
