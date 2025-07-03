import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";
import { INFO, ITEM1, ITEM2, ITEM3, PREFIX } from "./constants.ts";

Deno.test("first", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.has(ITEM1.id), true);
});

Deno.test("second", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.has(ITEM2.id), true);
});

Deno.test("third", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.has(ITEM3.id), true);
});
Deno.test("non-existent", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.has("foo"), false);
});
