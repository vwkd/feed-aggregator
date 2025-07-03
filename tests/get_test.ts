import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";
import { INFO, ITEM1, ITEM2, ITEM3, PREFIX } from "./constants.ts";

Deno.test("first", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.get(ITEM1.id), ITEM1);
});

Deno.test("second", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.get(ITEM2.id), ITEM2);
});

Deno.test("third", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.get(ITEM3.id), ITEM3);
});

Deno.test("non-existent", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.get("foo"), undefined);
});
