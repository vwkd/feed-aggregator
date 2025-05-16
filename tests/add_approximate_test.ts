import { assertEquals } from "@std/assert";
import { createFeedAggregator } from "../src/main.ts";

const PREFIX = ["my", "example", "feed"];

const VERSION = "https://jsonfeed.org/version/1.1";
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

Deno.test("add", async () => {
  const currentDate = { value: new Date() };

  const expected = JSON.stringify({
    version: VERSION,
    ...INFO,
    items: [ITEM1, ITEM2, ITEM3].map((item) => ({
      ...item,
      date_published: currentDate.value.toISOString(),
    })),
  });

  const kv = await Deno.openKv(":memory:");

  const feed = await createFeedAggregator(kv, PREFIX, INFO, { currentDate });
  await feed.add({ item: ITEM1, shouldApproximateDate: true });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, shouldApproximateDate: true })),
  );

  const actual = feed.toJSON();

  kv.close();

  assertEquals(actual, expected);
});
