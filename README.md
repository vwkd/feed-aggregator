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

### Configure logging

- log level defaults to `warn`
- log level `silent` disables logging
- change log level for all methods

```js
import { logger } from "@vwkd/feed-aggregator";

logger.setLevel("debug");
logger.rebuild();
```

- change log level for specific method, e.g. `add`

```js
import { logger } from "@vwkd/feed-aggregator";

const logAdd = logger.getLogger("add");
logAdd.setLevel("debug");
logAdd.rebuild();
```
