import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";
import {
  INFO,
  ITEM1,
  ITEM2,
  ITEM3,
  PATH,
  PREFIX,
  PREFIX2,
} from "./constants.ts";

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
