export const PATH = "tests/my_example_feed.db" as const;
export const PREFIX = ["my", "example", "feed"] as const;
export const PREFIX2 = ["my2", "example", "feed"] as const;
export const SUBPREFIX = ["my", "subprefix"] as const;

export const INFO = {
  title: "My Example Feed",
  home_page_url: "https://example.org",
  feed_url: "https://example.org/feed.json",
} as const;

export const ITEM1 = {
  id: "1",
  content_html: "<p>Hello, world!</p>",
  url: "https://example.org/initial-post",
} as const;

export const ITEM2 = {
  id: "2",
  content_text: "This is a second item.",
  url: "https://example.org/second-item",
} as const;

export const ITEM3 = {
  id: "3",
  content_html: "<p>This is a third item.</p>",
  content_text: "This is a third item.",
  url: "https://example.org/third-item",
} as const;

const VERSION = "https://jsonfeed.org/version/1.1" as const;

export const EXPECTED_EMPTY = JSON.stringify({
  version: VERSION,
  ...INFO,
  items: [],
});

export const EXPECTED_FULL = JSON.stringify({
  version: VERSION,
  ...INFO,
  items: [ITEM1, ITEM2, ITEM3],
});
