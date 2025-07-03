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
  SUBPREFIX,
} from "./constants.ts";

Deno.test("all persist", async () => {
  try {
    using feed = await createFeedAggregator(
      PATH,
      PREFIX,
      INFO,
    );
    await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

    await feed.removeAll();

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

Deno.test("all", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("all, first prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1, subprefix: SUBPREFIX });
  await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("all, second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add({ item: ITEM2, subprefix: SUBPREFIX });
  await feed.add({ item: ITEM3 });

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("all, third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2].map((item) => ({ item })));
  await feed.add({ item: ITEM3, subprefix: SUBPREFIX });

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("all, first second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2].map((item) => ({ item, subprefix: SUBPREFIX })),
  );
  await feed.add({ item: ITEM3 });

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("all, second third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("all, all prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("all, empty", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  await feed.removeAll();

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix, first prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1, subprefix: SUBPREFIX });
  await feed.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM2, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix, second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM2, subprefix: SUBPREFIX });
  await feed.add(...[ITEM1, ITEM3].map((item) => ({ item })));

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM3].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix, third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[ITEM1, ITEM2].map((item) => ({ item })));
  await feed.add({ item: ITEM3, subprefix: SUBPREFIX });

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add(...[ITEM1, ITEM2].map((item) => ({ item })));

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix, first second prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2].map((item) => ({ item, subprefix: SUBPREFIX })),
  );
  await feed.add({ item: ITEM3 });

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add({ item: ITEM3 });

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix, second third prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add({ item: ITEM1 });
  await feed.add(
    ...[ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);
  await feedExpected.add({ item: ITEM1 });

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix, all prefixed", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(
    ...[ITEM1, ITEM2, ITEM3].map((item) => ({ item, subprefix: SUBPREFIX })),
  );

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});

Deno.test("subprefix, empty", async () => {
  using feed = await createFeedAggregator(":memory:", PREFIX, INFO);

  await feed.removeAll(SUBPREFIX);

  using feedExpected = await createFeedAggregator(":memory:", PREFIX2, INFO);

  assertEquals(feed.toJSON(), feedExpected.toJSON());
});
