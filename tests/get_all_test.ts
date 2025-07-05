import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";
import { INFO, ITEM1, ITEM2, ITEM3, PREFIX, SUBPREFIX } from "./constants.ts";

Deno.test("all", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2 };
  const item3 = { item: ITEM3 };
  await feed.add(...[item1, item2, item3]);

  assertEquals(feed.getAll(), [item1, item2, item3]);
});

Deno.test("all, first prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1, subprefix: SUBPREFIX };
  const item2 = { item: ITEM2 };
  const item3 = { item: ITEM3 };
  await feed.add(item1);
  await feed.add(...[item2, item3]);

  assertEquals(feed.getAll(), [item2, item3, item1]);
});

Deno.test("all, second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3 };
  await feed.add(item1);
  await feed.add(item2);
  await feed.add(item3);

  assertEquals(feed.getAll(), [item1, item3, item2]);
});

Deno.test("all, third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2 };
  const item3 = { item: ITEM3, subprefix: SUBPREFIX };
  await feed.add(...[item1, item2]);
  await feed.add(item3);

  assertEquals(feed.getAll(), [item1, item2, item3]);
});

Deno.test("all, first second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1, subprefix: SUBPREFIX };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3 };
  await feed.add(...[item1, item2]);
  await feed.add(item3);

  assertEquals(feed.getAll(), [item3, item1, item2]);
});

Deno.test("all, second third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3, subprefix: SUBPREFIX };
  await feed.add(item1);
  await feed.add(...[item2, item3]);

  assertEquals(feed.getAll(), [item1, item2, item3]);
});

Deno.test("all, all prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1, subprefix: SUBPREFIX };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3, subprefix: SUBPREFIX };
  await feed.add(...[item1, item2, item3]);

  assertEquals(feed.getAll(), [item1, item2, item3]);
});

Deno.test("all, empty", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  assertEquals(feed.getAll(), []);
});

Deno.test("subprefix", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2 };
  const item3 = { item: ITEM3 };
  await feed.add(...[item1, item2, item3]);

  assertEquals(feed.getAll(SUBPREFIX), []);
});

Deno.test("subprefix, first prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1, subprefix: SUBPREFIX };
  const item2 = { item: ITEM2 };
  const item3 = { item: ITEM3 };
  await feed.add(item1);
  await feed.add(...[item2, item3]);

  assertEquals(feed.getAll(SUBPREFIX), [item1]);
});

Deno.test("subprefix, second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3 };
  await feed.add(item2);
  await feed.add(...[item1, item3]);

  assertEquals(feed.getAll(SUBPREFIX), [item2]);
});

Deno.test("subprefix, third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2 };
  const item3 = { item: ITEM3, subprefix: SUBPREFIX };
  await feed.add(...[item1, item2]);
  await feed.add(item3);

  assertEquals(feed.getAll(SUBPREFIX), [item3]);
});

Deno.test("subprefix, first second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1, subprefix: SUBPREFIX };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3 };
  await feed.add(...[item1, item2]);
  await feed.add(item3);

  assertEquals(feed.getAll(SUBPREFIX), [item1, item2]);
});

Deno.test("subprefix, second third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1 };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3, subprefix: SUBPREFIX };
  await feed.add(item1);
  await feed.add(...[item2, item3]);

  assertEquals(feed.getAll(SUBPREFIX), [item2, item3]);
});

Deno.test("subprefix, all prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  const item1 = { item: ITEM1, subprefix: SUBPREFIX };
  const item2 = { item: ITEM2, subprefix: SUBPREFIX };
  const item3 = { item: ITEM3, subprefix: SUBPREFIX };
  await feed.add(...[item1, item2, item3]);

  assertEquals(feed.getAll(SUBPREFIX), [item1, item2, item3]);
});

Deno.test("subprefix, empty", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  assertEquals(feed.getAll(SUBPREFIX), []);
});
