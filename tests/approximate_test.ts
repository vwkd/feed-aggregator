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

const ITEM1_NEW = {
  id: "1",
  content_html: "<p>Hello, NEW world!</p>",
  url: "https://example.org/initial-post",
};

const ITEM2 = {
  id: "2",
  content_text: "This is a second item.",
  url: "https://example.org/second-item",
};

const ITEM2_NEW = {
  id: "2",
  content_text: "This is a NEW second item.",
  url: "https://example.org/second-item",
};

const ITEM3 = {
  id: "3",
  content_html: "<p>This is a third item.</p>",
  content_text: "This is a third item.",
  url: "https://example.org/third-item",
};

const ITEM3_NEW = {
  id: "3",
  content_html: "<p>This is a NEW third item.</p>",
  content_text: "This is a third item.",
  url: "https://example.org/third-item",
};

Deno.test("add", async () => {
  const now = new Date();
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [ITEM1, ITEM2, ITEM3].map((item) => ({
      ...item,
      date_published: now.toISOString(),
    })),
  });

  const kv = await Deno.openKv(":memory:");

  const feed = new FeedAggregator(kv, PREFIX, INFO, now);
  await feed.add({ item: ITEM1, shouldApproximateDate: true });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, shouldApproximateDate: true })),
  );

  const actual = await feed.toJSON();

  kv.close();

  assertEquals(actual, expected);
});

Deno.test("overwrite, equal", async () => {
  const now = new Date();
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [ITEM1, ITEM2, ITEM3].map((item) => ({
      ...item,
      date_published: now.toISOString(),
    })),
  });
  const dateInFuture = new Date(Date.now() + DELAY_MS);

  const kv = await Deno.openKv(":memory:");

  const feed = new FeedAggregator(kv, PREFIX, INFO, now);
  await feed.add({ item: ITEM1, shouldApproximateDate: true });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, shouldApproximateDate: true })),
  );

  const actual = await feed.toJSON();

  assertEquals(actual, expected);

  await delay(DELAY_MS * 2);

  const feed2 = new FeedAggregator(kv, PREFIX, INFO, dateInFuture);
  await feed2.add({ item: ITEM1, shouldApproximateDate: true });
  await feed2.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, shouldApproximateDate: true })),
  );

  const actual2 = await feed2.toJSON();

  kv.close();

  assertEquals(actual2, expected);
});

Deno.test("overwrite, different", async () => {
  const now = new Date();
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [ITEM1, ITEM2, ITEM3].map((item) => ({
      ...item,
      date_published: now.toISOString(),
    })),
  });
  const dateInFuture = new Date(Date.now() + DELAY_MS);
  const expected2 = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [ITEM1_NEW, ITEM2_NEW, ITEM3_NEW].map((item) => ({
      ...item,
      date_published: now.toISOString(),
      date_modified: dateInFuture.toISOString(),
    })),
  });

  const kv = await Deno.openKv(":memory:");

  const feed = new FeedAggregator(kv, PREFIX, INFO, now);
  await feed.add({ item: ITEM1, shouldApproximateDate: true });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, shouldApproximateDate: true })),
  );

  const actual = await feed.toJSON();

  assertEquals(actual, expected);

  await delay(DELAY_MS * 2);

  const feed2 = new FeedAggregator(kv, PREFIX, INFO, dateInFuture);
  await feed2.add({ item: ITEM1_NEW, shouldApproximateDate: true });
  await feed2.add(
    ...[ITEM2_NEW, ITEM3_NEW].map((item) => ({
      item,
      shouldApproximateDate: true,
    })),
  );

  const actual2 = await feed2.toJSON();

  kv.close();

  assertEquals(actual2, expected2);
});
