import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";

const PREFIX = ["my", "example", "feed"];
const SUBPREFIX = ["my", "subprefix"];

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

Deno.test("all", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.getAll(), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("all, first prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1, subprefix: SUBPREFIX });
  await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.getAll(), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("all, second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add({ item: ITEM2, subprefix: SUBPREFIX });
  await feed.add({ item: ITEM3 });

  assertEquals(feed.getAll(), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("all, third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2].map((item) => ({ item })));
  await feed.add({ item: ITEM3, subprefix: SUBPREFIX });

  assertEquals(feed.getAll(), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("all, first second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2].map((item) => ({ item, subprefix: SUBPREFIX })),
  );
  await feed.add({ item: ITEM3 });

  assertEquals(feed.getAll(), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("all, second third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  assertEquals(feed.getAll(), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("all, all prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  assertEquals(feed.getAll(), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("all, empty", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  assertEquals(feed.getAll(), []);
});

Deno.test("subprefix", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.getAll(SUBPREFIX), []);
});

Deno.test("subprefix, first prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1, subprefix: SUBPREFIX });
  await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.getAll(SUBPREFIX), [ITEM1]);
});

Deno.test("subprefix, second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM2, subprefix: SUBPREFIX });
  await feed.add(...[ITEM1, ITEM3].map((item) => ({ item })));

  assertEquals(feed.getAll(SUBPREFIX), [ITEM2]);
});

Deno.test("subprefix, third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2].map((item) => ({ item })));
  await feed.add({ item: ITEM3, subprefix: SUBPREFIX });

  assertEquals(feed.getAll(SUBPREFIX), [ITEM3]);
});

Deno.test("subprefix, first second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2].map((item) => ({ item, subprefix: SUBPREFIX })),
  );
  await feed.add({ item: ITEM3 });

  assertEquals(feed.getAll(SUBPREFIX), [ITEM1, ITEM2]);
});

Deno.test("subprefix, second third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  assertEquals(feed.getAll(SUBPREFIX), [ITEM2, ITEM3]);
});

Deno.test("subprefix, all prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  assertEquals(feed.getAll(SUBPREFIX), [ITEM1, ITEM2, ITEM3]);
});

Deno.test("subprefix, empty", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  assertEquals(feed.getAll(SUBPREFIX), []);
});
