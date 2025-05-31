# README

JSON Feed aggregator



## Features

- stateful JSON feed
- cache items using Deno KV
- update existing items
- expire items, e.g. feed of future events



## Usage

### Create feed

```js
import { createFeedAggregator } from "@vwkd/feed-aggregator";

const path = ":memory:";
const prefix = ["my", "example", "feed"];

using feed = await createFeedAggregator(
  path,
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

const json = feed.toJSON();
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
