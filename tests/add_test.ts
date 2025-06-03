import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";

const PATH = "tests/add.db" as const;
const PREFIX = ["my", "example", "feed"] as const;

const VERSION = "https://jsonfeed.org/version/1.1" as const;
const INFO = {
  title: "My Example Feed",
  home_page_url: "https://example.org",
  feed_url: "https://example.org/feed.json",
} as const;

const ITEM1 = {
  id: "1",
  content_html: "<p>Hello, world!</p>",
  url: "https://example.org/initial-post",
} as const;

const ITEM2 = {
  id: "2",
  content_text: "This is a second item.",
  url: "https://example.org/second-item",
} as const;

const ITEM3 = {
  id: "3",
  content_html: "<p>This is a third item.</p>",
  content_text: "This is a third item.",
  url: "https://example.org/third-item",
} as const;

const EXPECTED = JSON.stringify({
  version: VERSION,
  ...INFO,
  items: [ITEM1, ITEM2, ITEM3],
});

Deno.test("add", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  const actual = feed.toJSON();

  assertEquals(actual, EXPECTED);
});

Deno.test("persist", async () => {
  try {
    using feed = await createFeedAggregator(PATH, PREFIX, INFO);
    await feed.add({ item: ITEM1 });
    await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

    using feed2 = await createFeedAggregator(PATH, PREFIX, INFO);

    const actual = feed2.toJSON();

    assertEquals(actual, EXPECTED);
  } finally {
    await Deno.remove(PATH);
  }
});
