import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";

const PATH = "tests/remove.db" as const;
const PREFIX = ["my", "example", "feed"] as const;
const PREFIX2 = ["my2", "example", "feed"] as const;

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

Deno.test("persist", async () => {
  try {
    using feed = await createFeedAggregator(
      PATH,
      PREFIX,
      INFO,
    );
    await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

    await feed.remove(ITEM2.id);

    using feedActual = await createFeedAggregator(
      PATH,
      PREFIX,
      INFO,
    );

    assertEquals(feedActual.toJSON(), feed.toJSON());
  } finally {
    await Deno.remove(PATH);
  }
});

Deno.test("first", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove(ITEM1.id);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("second", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove(ITEM2.id);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});
Deno.test("third", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove(ITEM3.id);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM2].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});
Deno.test("non-existent", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.remove("foo");

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});
