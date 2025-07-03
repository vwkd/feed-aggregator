import { assertEquals } from "@std/assert";
import { delay } from "@std/async";
import { createFeedAggregator } from "../src/main.ts";
import {
  EXPECTED_EMPTY,
  EXPECTED_FULL,
  INFO,
  ITEM1,
  ITEM2,
  ITEM3,
  PATH,
  PREFIX,
} from "./constants.ts";

const DELAY_MS = 500 as const;

Deno.test("add", async () => {
  const dateInFuture = new Date(Date.now() + DELAY_MS);

  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1, expireAt: dateInFuture });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, expireAt: dateInFuture })),
  );

  const actual = feed.toJSON();

  assertEquals(actual, EXPECTED_FULL);
});

Deno.test("persist", async () => {
  const dateInFuture = new Date(Date.now() + DELAY_MS);

  try {
    using feed = await createFeedAggregator(PATH, PREFIX, INFO);
    await feed.add({ item: ITEM1, expireAt: dateInFuture });
    await feed.add(
      ...[ITEM2, ITEM3].map((item) => ({ item, expireAt: dateInFuture })),
    );

    await delay(DELAY_MS * 2);

    using feed2 = await createFeedAggregator(PATH, PREFIX, INFO);

    const actual = feed2.toJSON();

    assertEquals(actual, EXPECTED_EMPTY);
  } finally {
    await Deno.remove(PATH);
  }
});
