import { assertEquals } from "@std/assert";
import { delay } from "@std/async";
import { FeedAggregator } from "../src/main.ts";

const DELAY_MS = 500;
const PREFIX = ["my", "example", "feed"];

const VERSION = "https://jsonfeed.org/version/1.1";
const INFO = {
  title: "My Example Feed",
  home_page_url: "https://example.org",
  feed_url: "https://example.org/feed.json",
};

const ITEM1 = {
  id: "1",
  content_html: "<p>Hello, world!</p>",
  url: "https://example.org/initial-post",
};

const ITEM2 = {
  id: "2",
  content_text: "This is a second item.",
  url: "https://example.org/second-item",
};

const ITEM3 = {
  id: "3",
  content_html: "<p>This is a third item.</p>",
  content_text: "This is a third item.",
  url: "https://example.org/third-item",
};

Deno.test("add", async () => {
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [ITEM1, ITEM2, ITEM3],
  });

  const dateInFuture = new Date(Date.now() + DELAY_MS);

  const kv = await Deno.openKv(":memory:");

  const feed = new FeedAggregator(kv, PREFIX, INFO);
  await feed.add({ item: ITEM1, expireAt: dateInFuture });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, expireAt: dateInFuture })),
  );

  const actual = await feed.toJSON();

  kv.close();

  assertEquals(actual, expected);
});

Deno.test("persist", async () => {
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [],
  });

  const dateInFuture = new Date(Date.now() + DELAY_MS);

  const kv = await Deno.openKv(":memory:");

  const feed = new FeedAggregator(kv, PREFIX, INFO);
  await feed.add({ item: ITEM1, expireAt: dateInFuture });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, expireAt: dateInFuture })),
  );

  const _actual = await feed.toJSON();

  await delay(DELAY_MS * 2);

  const feed2 = new FeedAggregator(kv, PREFIX, INFO);

  const actual = await feed2.toJSON();

  kv.close();

  assertEquals(actual, expected);
});
