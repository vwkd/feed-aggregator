import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";
import { EXPECTED_EMPTY, INFO, PREFIX } from "./constants.ts";

Deno.test("create", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  const actual = feed.toJSON();

  assertEquals(actual, EXPECTED_EMPTY);
});
