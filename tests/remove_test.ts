import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";

const PREFIX = ["my", "example", "feed"];
const PREFIX2 = ["my2", "example", "feed"];

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

Deno.test("persist", async () => {
  const kv = await Deno.openKv(":memory:");

  const feed = await createFeedAggregator(kv, PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove(ITEM2.id);

  const feedActual = await createFeedAggregator(kv, PREFIX, INFO);

  assertEquals(feedActual.toJSON(), feed.toJSON());

  kv.close();
});

Deno.test("first", async () => {
  const kv = await Deno.openKv(":memory:");

  const feed = await createFeedAggregator(kv, PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove(ITEM1.id);

  const feedExpected = await createFeedAggregator(kv, PREFIX2, INFO);
  await feedExpected.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());

  kv.close();
});

Deno.test("second", async () => {
  const kv = await Deno.openKv(":memory:");

  const feed = await createFeedAggregator(kv, PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove(ITEM2.id);

  const feedExpected = await createFeedAggregator(kv, PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());

  kv.close();
});

Deno.test("third", async () => {
  const kv = await Deno.openKv(":memory:");

  const feed = await createFeedAggregator(kv, PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove(ITEM3.id);

  const feedExpected = await createFeedAggregator(kv, PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM2].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());

  kv.close();
});

Deno.test("non-existent", async () => {
  const kv = await Deno.openKv(":memory:");

  const feed = await createFeedAggregator(kv, PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove("foo");

  const feedExpected = await createFeedAggregator(kv, PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());

  kv.close();
});
