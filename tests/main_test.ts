import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";

const PREFIX = ["my", "example", "feed"];

const VERSION = "https://jsonfeed.org/version/1.1";
const INFO = {
  title: "My Example Feed",
  home_page_url: "https://example.org",
  feed_url: "https://example.org/feed.json",
};

Deno.test("create", async () => {
  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [],
  });

  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  const actual = feed.toJSON();

  assertEquals(actual, expected);
});
