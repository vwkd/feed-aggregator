export type {
  Attachment,
  Author,
  BaseItem,
  FeedInfo,
  HTMLItem,
  Hub,
  Item,
  TextItem,
} from "@vwkd/feed";
export type { AggregatorItem } from "./types.ts";
import { Feed, type FeedInfo } from "@vwkd/feed";
import { equal } from "@std/assert";
import type { AggregatorItem } from "./types.ts";

const DENO_KV_MAX_BATCH_SIZE = 1000;

/**
 * JSON Feed aggregator using Deno KV
 *
 * - creates JSON Feed with added items and remaining existing items from database
 * - caches added items with optional expiry if not already identical in database
 * - beware: existing items that aren't in added items anymore and have no expiry won't be deleted from database forever!
 * - beware: order of items in feed isn't guaranteed since database returns in lexicographical order of keys
 * - beware: expiry is earliest time after which Deno KV deletes items, may get slightly expired ones but doesn't matter, don't bother to do deletion work manually!
 */
export class FeedAggregator {
  #initialized = false;
  #kv: Deno.Kv;
  #prefix: string[];
  #info: FeedInfo;
  #now: Date;
  #itemsCached: AggregatorItem[] = [];
  #itemsAdded: AggregatorItem[] = [];

  /**
   * Create new JSON Feed Aggregator
   *
   * @param kv Deno KV store
   * @param prefix prefix for keys
   * @param info info of feed
   */
  constructor(kv: Deno.Kv, prefix: string[], info: FeedInfo) {
    this.#kv = kv;
    this.#prefix = prefix;
    this.#info = info;
    this.#now = new Date();
  }

  /**
   * Initialize cached items from database
   *
   * - filter out expired items, will get deleted by Deno KV eventually
   * - beware: must be called first and only once!
   */
  async #init(): Promise<void> {
    // beware: not guaranteed to be consistent between batches!
    const entriesIterator = this.#kv.list<AggregatorItem>({
      prefix: this.#prefix,
    }, {
      batchSize: DENO_KV_MAX_BATCH_SIZE,
    });

    const entries = await Array.fromAsync(entriesIterator);

    const items = entries
      .map((item) => item.value);

    const itemsWithoutExpired = items
      .filter(({ expireAt }) => !expireAt || expireAt > this.#now);

    this.#itemsCached = itemsWithoutExpired;
  }

  /**
   * Add items to feed
   *
   * - if item with same ID is already in feed
   *   - if item is identical, ignores added item, takes existing item from feed
   *   - if item is different, takes added item, will overwrite existing item in feed
   *
   * @param items items to add
   * @throws {Error} if item with same ID already added
   * @throws {Error} if `expireAt` is in the past
   */
  async add(...items: AggregatorItem[]): Promise<void> {
    if (!this.#initialized) {
      await this.#init();
      this.#initialized = true;
    }

    for (const { item, expireAt } of items) {
      if (this.#itemsAdded.some(({ item: { id } }) => id == item.id)) {
        throw new Error(`Item with ID '${item.id}' already added`);
      }

      if (expireAt && expireAt <= this.#now) {
        throw new Error(
          `Expiry date for item with ID '${item.id}' is not in future`,
        );
      }

      const existingItem = this.#itemsCached.find(({ item: { id } }) =>
        id == item.id
      );

      if (existingItem) {
        if (equal(existingItem, item)) {
          // don't use added item
          continue;
        } else {
          // don't use existing item
          this.#itemsCached = this.#itemsCached.filter(({ item: { id } }) =>
            id != item.id
          );
        }
      }

      this.#itemsAdded.push({ item, expireAt });
    }
  }

  /**
   * Serialize feed
   *
   * - store added items in database
   * - add all items to feed and return it as JSON
   *
   * @returns JSON of feed
   */
  async toJSON(): Promise<string> {
    if (!this.#initialized) {
      await this.#init();
      this.#initialized = true;
    }

    if (this.#itemsAdded.length > 0) {
      // note: `ok` property of result will always be `true` since transaction lacks `.check()`s
      await this.#kv
        .atomic()
        .mutate(...this.#itemsAdded.map((item) => ({
          key: [...this.#prefix, item.item.id],
          value: item,
          type: "set" as const,
          expireIn: item.expireAt &&
            (item.expireAt.getTime() - this.#now.getTime()),
        })))
        .commit();
    }

    const feed = new Feed(this.#info);

    feed.add(...this.#itemsCached.map(({ item }) => item));
    feed.add(...this.#itemsAdded.map(({ item }) => item));

    return feed.toJSON();
  }
}
