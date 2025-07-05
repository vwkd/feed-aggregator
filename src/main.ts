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
export type { AggregatorItem, Options, SharedDate } from "./types.ts";
import { Feed, type FeedInfo, type Item } from "@vwkd/feed";
import { type KvToolbox, openKvToolbox } from "@kitsonk/kv-toolbox";
import type { AggregatorItem, Options, SharedDate } from "./types.ts";
import {
  logAdd,
  logClean,
  logGet,
  logHas,
  logRead,
  logRemove,
  logRoot,
  logToJSON,
  logWrite,
} from "./log.ts";
import { equal } from "@std/assert";
export { log as logger } from "./log.ts";

const DENO_KV_MAX_BATCH_SIZE = 1000;

/**
 * JSON Feed aggregator
 *
 * - creates JSON Feed and persists it using Deno KV
 * - persists pending items with optional expiry if not already identical in Deno KV
 * - beware: items without expiry won't be ever deleted from Deno KV!
 * - order of items in feed by lexicographical order of keys
 * - beware: manually filter out expired items since expiry is earliest time after which Deno KV deletes items, don't bother to persist deletion since Deno KV will delete eventually!
 */
export class FeedAggregator implements Disposable {
  #initialized = false;
  #kv: KvToolbox;
  #prefix: readonly string[];
  #info: FeedInfo;
  #currentDate?: SharedDate;
  #itemsStored: Map<string, AggregatorItem> = new Map();

  /**
   * Create new JSON Feed Aggregator
   *
   * - beware: don't call constructor directly, instead use factory function `createFeedAggregator`!
   *
   * @param kv Deno KV store
   * @param prefix prefix for keys
   * @param info info of feed
   * @param options options
   */
  private constructor(
    kv: KvToolbox,
    prefix: readonly string[],
    info: FeedInfo,
    options: Options = {},
  ) {
    logRoot.info(`Creating feed aggregator`, { prefix, info, options });

    const { currentDate } = options;

    this.#kv = kv;
    this.#prefix = prefix;
    this.#info = info;
    this.#currentDate = currentDate;
  }

  /**
   * Validate feed aggregator is initialized
   *
   * @throws {Error} if not initialized
   */
  #checkInitialized(): void {
    if (!this.#initialized) {
      throw new Error(
        `Uninitialized instance. Don't call constructor directly. Instead use factory function 'createFeedAggregator'.`,
      );
    }

    return;
  }

  /**
   * Clean up expired items if any
   *
   * - in case Deno KV hasn't deleted them yet
   * - in case items have expired since created instance or added
   * - beware: must be called first and every time!
   * - note: take `now` as argument to avoid slight time gap
   *
   * @param now current date
   */
  #clean(now: Date): void {
    for (const [id, item] of this.#itemsStored.entries()) {
      if (item.expireAt && item.expireAt <= now) {
        logClean.debug(`Cleaning up expired item with ID ${id}`);

        this.#itemsStored.delete(id);
      }
    }
  }

  /**
   * Initialize feed aggregator
   */
  async #initialize(): Promise<void> {
    const now = this.#currentDate?.value || new Date();

    logRoot.debug(`Initializing feed aggregator at ${now.toISOString()}`);

    await this.#read();

    this.#clean(now);
  }

  /**
   * Read items from database
   *
   * - beware: might get expired items, run `clean()` before using!
   * - beware: must be called first!
   */
  async #read(): Promise<void> {
    // run only once
    if (this.#initialized) {
      return;
    }

    logRead.debug(`Reading items from database`);

    // beware: not guaranteed to be consistent between batches!
    const entriesIterator = this.#kv.list<AggregatorItem>({
      prefix: this.#prefix,
    }, {
      batchSize: DENO_KV_MAX_BATCH_SIZE,
    });

    for await (const { value } of entriesIterator) {
      const itemId = value.item.id;

      this.#itemsStored.set(itemId, value);
    }

    logRead.debug(
      `Read ${this.#itemsStored.size} item${
        this.#itemsStored.size == 1 ? "" : "s"
      } from database`,
    );
    this.#initialized = true;
  }

  /**
   * Sort function for items by lexicographical order of keys
   *
   * @param a first item
   * @param b second item
   * @returns negative number if key of `a` is before `b`, positive number if key of `b` is before `a`, zero if keys are equal
   */
  #sortByKeys(a: AggregatorItem, b: AggregatorItem): number {
    const aKey = [...this.#prefix, ...(a.subprefix ?? []), a.item.id];
    const bKey = [...this.#prefix, ...(b.subprefix ?? []), b.item.id];

    if (aKey.length != bKey.length) {
      return aKey.length - bKey.length;
    }

    // note: could as well use `bKey.length` since identical
    for (let i = 0; i < aKey.length; i += 1) {
      const keyPartOrdering = aKey[i].localeCompare(bKey[i]);

      if (keyPartOrdering < 0) {
        return -1;
      } else if (keyPartOrdering > 0) {
        return 1;
      }
    }

    return 0;
  }

  /**
   * Write items to database
   *
   * - note: take `now` as argument to avoid slight time gap
   *
   * @param itemsPending items to write
   * @param now current date
   */
  async #write(
    itemsPending: AggregatorItem[],
    now: Date,
  ): Promise<void> {
    if (itemsPending.length == 0) {
      return;
    }

    logWrite.debug(`Writing items to database`);

    const items = itemsPending
      .map((item) => ({
        key: [...this.#prefix, ...(item.subprefix ?? []), item.item.id],
        value: item,
        type: "set" as const,
        expireIn: item.expireAt && (item.expireAt.getTime() - now.getTime()),
      }));

    // note: `ok` property of result will always be `true` since transaction lacks `.check()`s
    await this.#kv
      .atomic()
      .mutate(...items)
      .commit();

    const itemsSorted = [...this.#itemsStored.values(), ...itemsPending]
      .sort(this.#sortByKeys.bind(this));

    this.#itemsStored = new Map(
      itemsSorted.map((item) => [item.item.id, item]),
    );

    logWrite.debug(
      `Wrote ${itemsPending.length} item${
        itemsPending.length > 1 ? "s" : ""
      } to database`,
    );
  }

  /**
   * Create new JSON Feed Aggregator
   *
   * @param path path for Deno KV store
   * @param prefix prefix for keys
   * @param info info of feed
   * @param options options
   * @returns JSON Feed Aggregator
   */
  static async create(
    path: string | undefined,
    prefix: readonly string[],
    info: FeedInfo,
    options: Options = {},
  ): Promise<FeedAggregator> {
    const kv = await openKvToolbox({ path });

    const feedAggregator = new FeedAggregator(kv, prefix, info, options);

    await feedAggregator.#initialize();

    return feedAggregator;
  }

  /**
   * Add items to feed
   *
   * - ignores item if `expireAt` is in the past
   * - store items in database
   *
   * @param items items to add
   * @throws {Error} if item with same ID is already in feed
   */
  async add(...items: AggregatorItem[]): Promise<void> {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    logAdd.debug(
      `Adding item${items.length > 1 ? "s" : ""} at ${now.toISOString()}`,
    );

    this.#clean(now);

    const itemsPending: AggregatorItem[] = [];

    for (const _item of items) {
      // clone to avoid modifying input arguments
      const { item, subprefix, expireAt } = structuredClone(_item);

      logAdd.debug(`Item`, item);

      if (this.#itemsStored.has(item.id)) {
        throw new Error(`Already added`);
      }

      if (expireAt && expireAt <= now) {
        logAdd.debug(
          `Skipping since already expired at ${expireAt.toISOString()}`,
        );
        continue;
      }

      logAdd.debug(`Adding`);

      itemsPending.push({
        item,
        ...(subprefix && { subprefix }),
        ...(expireAt && { expireAt }),
      });
    }

    await this.#write(itemsPending, now);
  }

  /**
   * Get item from feed
   *
   * @param itemId ID of feed item
   * @returns item or undefined if not found
   */
  get(itemId: string): Item | undefined {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    logGet.debug(`Getting item with ID ${itemId} at ${now.toISOString()}`);

    this.#clean(now);

    return structuredClone(this.#itemsStored.get(itemId)?.item);
  }

  /**
   * Get all items from feed
   *
   * @param subprefix subprefix of items
   * @returns list of items
   */
  getAll(subprefix?: readonly string[]): Item[] {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    const prefix = [...this.#prefix, ...(subprefix ?? [])];

    logGet.debug(
      `Getting all items for prefix '${
        prefix.join("/")
      }' at ${now.toISOString()}`,
    );

    this.#clean(now);

    return structuredClone(
      Array.from(
        this.#itemsStored.values().filter((item) =>
          !subprefix || equal(item.subprefix, subprefix)
        ).map(({ item }) => item),
      ),
    );
  }

  /**
   * Check if item is in feed
   *
   * @param itemId ID of feed item
   * @returns `true` if item is in feed, `false` otherwise
   */
  has(itemId: string): boolean {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    logHas.debug(
      `Checking if item with ID ${itemId} is in feed at ${now.toISOString()}`,
    );

    this.#clean(now);

    return this.#itemsStored.has(itemId);
  }

  /**
   * Remove item from feed
   *
   * @param itemId ID of feed item
   * @returns `true` if item existed and has been removed, `false` if item doesn't exist
   */
  async remove(itemId: string): Promise<boolean> {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    logRemove.debug(`Removing item with ID ${itemId} at ${now.toISOString()}`);

    this.#clean(now);

    const item = this.#itemsStored.get(itemId);

    if (!item) {
      return false;
    }

    const key = [...this.#prefix, ...(item.subprefix ?? []), item.item.id];
    await this.#kv.delete(key);

    // note: always `true` since item exists
    return this.#itemsStored.delete(itemId);
  }

  /**
   * Remove all items from feed
   *
   * @param subprefix subprefix of items
   * @returns list of commit results
   */
  removeAll(
    subprefix?: readonly string[],
  ): Promise<(Deno.KvCommitResult | Deno.KvCommitError)[]> {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    const prefix = [...this.#prefix, ...(subprefix ?? [])];

    logRemove.debug(
      `Removing all items for prefix '${
        prefix.join("/")
      }' at ${now.toISOString()}`,
    );

    this.#clean(now);

    let transaction = this.#kv.atomic();

    for (const [itemId, item] of this.#itemsStored.entries()) {
      if (subprefix && !equal(item.subprefix, subprefix)) {
        continue;
      }

      const key = [...prefix, itemId];
      transaction = transaction.mutate({
        key,
        type: "delete",
      });

      this.#itemsStored.delete(itemId);
    }

    return transaction.commit();
  }

  /**
   * Serialize feed
   *
   * @returns JSON of feed
   */
  toJSON(): string {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    logToJSON.debug(`Getting feed as JSON at ${now.toISOString()}`);

    const feed = new Feed(this.#info);

    this.#clean(now);

    feed.add(...this.#itemsStored.values().map(({ item }) => item));

    return feed.toJSON();
  }

  /**
   * Dispose feed aggregator
   *
   * - closes database
   */
  [Symbol.dispose](): void {
    this.#checkInitialized();

    this.#kv.close();
  }
}

export const createFeedAggregator = FeedAggregator.create;
