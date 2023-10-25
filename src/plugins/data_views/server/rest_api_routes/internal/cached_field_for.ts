/* eslint-disable @kbn/eslint/require-license-header */
import { KibanaRequest } from '@kbn/core-http-server';
import { QueryDslQueryContainer } from '@kbn/data-views-plugin/common/types';
import { getHttpService } from './fields_for';
import { IndexPatternsFetcher } from '../../fetcher';
// Cache the last recently used
class LRUCache {
  cache: Map<any, any>;
  max: number;
  constructor(max = 10) {
    this.max = max;
    this.cache = new Map();
  }

  get(key: any) {
    const item = this.cache.get(key);
    if (item) {
      // refresh key
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: any, val: any) {
    // refresh key
    if (this.cache.has(key)) this.cache.delete(key);
    // evict oldest
    else if (this.cache.size === this.max) this.cache.delete(this.first());
    this.cache.set(key, val);
  }

  first() {
    return this.cache.keys().next().value;
  }
}
const userCache = new LRUCache(100); // Store most recent 100 users

export const getFieldsForWildcard = async (
  indexPatterns: IndexPatternsFetcher,
  request: KibanaRequest,
  options: {
    pattern: string | string[];
    metaFields?: string[];
    fieldCapsOptions?: { allow_no_indices: boolean; includeUnmapped?: boolean };
    type?: string;
    rollupIndex?: string;
    indexFilter?: QueryDslQueryContainer;
    fields?: string[];
  }
) => {
  const http = getHttpService();
  const authState: any = http.auth.get(request).state;
  let cache: LRUCache | undefined;
  // Only build cached responses if we can get the username and roles
  if (authState) {
    const userKey = authState.username + authState.roles;
    cache = userCache.get(userKey);
    if (!cache) {
      cache = new LRUCache(30); // store 30 indicies per user
      userCache.set(userKey, cache);
    }
  }
  // Remove the index filter??
  // this is a filter to only return the columns that are avalible in the current dataset (using the time/filter)
  // so they can distinguish between empty fields and all fields
  // it kills caching, because the time fields changes, but with every query

  // if we delete it we can always return a cached value for all fields
  // delete options.indexFilter;

  if (options.indexFilter) {
    cache = undefined; // Lets not cache these for now we can reassess
  }
  if (cache && cache.get(JSON.stringify(options))) {
    const cached = cache.get(JSON.stringify(options));
    // Do a lookup that is async of the cached return to always keep the cache up to date.
    indexPatterns.getFieldsForWildcard(options).then(({ fields, indices }: any) => {
      if (cache) {
        cache.set(JSON.stringify(options), { fields, indices });
      }
    });
    return cached;
  } else {
    // Nothing in cache lets do a fresh query
    const { fields, indices } = await indexPatterns.getFieldsForWildcard(options);
    // Set the cache if we have authenticated users and a cache
    if (cache) {
      cache.set(JSON.stringify(options), { fields, indices });
    }
    return { fields, indices };
  }
};
