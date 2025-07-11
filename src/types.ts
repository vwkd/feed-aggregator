import type { Item } from "@vwkd/feed";
import type { FeedAggregator } from "@vwkd/feed-aggregator";

/**
 * Feed options
 */
export interface Options {
  /** Initial feed to copy items from
   *
   * - must be same or more general feed
   * - avoids reading items from database
   * - won't be mutated
   * - beware: doesn't manage mismatch with database, i.e. additional initial items won't be stored in database, additional database items won't be in feed!
   */
  initialFeed?: FeedAggregator;
  /** Current date */
  currentDate?: SharedDate;
}

/**
 * Item with options
 */
export interface AggregatorItem {
  /** Item */
  item: Item;
  /** Subprefix for key */
  subprefix?: readonly string[];
  /** Expiry date of item */
  expireAt?: Date;
}

/**
 * Shared date
 *
 * - allows to set deterministic value of date, e.g. for testing
 * - user can mutate `value` property of argument to change date
 */
// todo: make such user can change but library can only read
export interface SharedDate {
  /** Date to share */
  value: Date;
}
