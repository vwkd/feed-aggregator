import { assertEquals } from "@std/assert";
import { delay } from "@std/async";
import { createFeedAggregator } from "../src/main.ts";

const DELAY_MS = 500 as const;
const PATH = "tests/add_expire.db" as const;
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

Deno.test("add", async () => {
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [ITEM1, ITEM2, ITEM3],
  });

  const dateInFuture = new Date(Date.now() + DELAY_MS);

  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1, expireAt: dateInFuture });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, expireAt: dateInFuture })),
  );

  const actual = feed.toJSON();

  assertEquals(actual, expected);
});

Deno.test("persist", async () => {
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [],
  });

  const dateInFuture = new Date(Date.now() + DELAY_MS);

  try {
    using feed = await createFeedAggregator(PATH, PREFIX, INFO);
    await feed.add({ item: ITEM1, expireAt: dateInFuture });
    await feed.add(
      ...[ITEM2, ITEM3].map((item) => ({ item, expireAt: dateInFuture })),
    );

    await delay(DELAY_MS * 2);

    using feed2 = await createFeedAggregator(PATH, PREFIX, INFO);

    const actual = feed2.toJSON();

    assertEquals(actual, expected);
  } finally {
    await Deno.remove(PATH);
  }
});
