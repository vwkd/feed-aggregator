import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";
import {
  EXPECTED_FULL,
  INFO,
  ITEM1,
  ITEM2,
  ITEM3,
  PATH,
  PREFIX,
} from "./constants.ts";

Deno.test("add", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  const actual = feed.toJSON();

  assertEquals(actual, EXPECTED_FULL);
});

Deno.test("persist", async () => {
  try {
    using feed = await createFeedAggregator(PATH, PREFIX, INFO);
    await feed.add({ item: ITEM1 });
    await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

    using feed2 = await createFeedAggregator(PATH, PREFIX, INFO);

    const actual = feed2.toJSON();

    assertEquals(actual, EXPECTED_FULL);
  } finally {
    await Deno.remove(PATH);
  }
});

Deno.test("order", async () => {
  try {
    using feed = await createFeedAggregator(PATH, PREFIX, INFO);
    await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));
    await feed.add({ item: ITEM1 });

    const actual = feed.toJSON();

    assertEquals(actual, EXPECTED_FULL);
  } finally {
    await Deno.remove(PATH);
  }
});
