/* eslint-disable @kbn/eslint/require-license-header */
import { KibanaRequest } from '@kbn/core-http-server';
import { QueryDslQueryContainer } from '@kbn/data-views-plugin/common/types';
import { IUiSettingsClient, UiSettingsServiceSetup } from '@kbn/core/server';
import { uiSetting } from '@kbn/expressions-plugin/common';
import { schema } from '@kbn/config-schema';
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
let currentIndexDepth = 30;
let indexCache = new LRUCache(currentIndexDepth); // Store most recent 100 users

export const getFieldsForWildcard = async (
  ctx: any,
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
  const uiSettingClient: IUiSettingsClient = (await ctx.core).uiSettings.client;
  const [ccsEnabled, indexDepth, debug] = await Promise.all([
    uiSettingClient.get<boolean>('cachedCCSFields:enabled'),
    uiSettingClient.get<number>('cachedCCSFields:indexDepth'),
    uiSettingClient.get<number>('cachedCCSFields:debug'),
  ]);
  if (indexDepth !== currentIndexDepth) {
    currentIndexDepth = indexDepth;
    indexCache = new LRUCache(currentIndexDepth); // Store most recent 100 users
  }
  let cache: LRUCache | undefined;

  if (debug) {
    console.log(indexCache);
  }
  // Remove the index filter??
  // this is a filter to only return the columns that are avalible in the current dataset (using the time/filter)
  // so they can distinguish between empty fields and all fields
  // it kills caching, because the time fields changes, but with every query

  // if we delete it we can always return a cached value for all fields
  // delete options.indexFilter;

  if (options.indexFilter) {
    cache = undefined; // Lets not cache these for now we can reassess (this changes with the time filters)
  } else {
    cache = indexCache;
  }
  if (ccsEnabled && cache && cache.get(JSON.stringify(options))) {
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
    if (ccsEnabled && cache) {
      cache.set(JSON.stringify(options), { fields, indices });
    }
    return { fields, indices };
  }
};

export const setupCCSCacheSettings = (uiSettings: UiSettingsServiceSetup) => {
  uiSettings.register({
    'cachedCCSFields:enabled': {
      name: 'Enable',
      description: 'Enables caching for Cross cluster fields',
      category: ['crossClusterCache'],
      order: 1,
      type: 'boolean',
      value: false,
      requiresPageReload: false,
      schema: schema.boolean(),
    },
    'cachedCCSFields:indexDepth': {
      name: 'Index Depth',
      description: 'The number of indexes to cache',
      sensitive: true,
      category: ['crossClusterCache'],
      order: 2,
      type: 'number',
      value: currentIndexDepth,
      requiresPageReload: false,
      schema: schema.number({ min: 1, max: 1000 }),
    },
    'cachedCCSFields:debug': {
      name: 'Cross cluster cache debug',
      description: 'Causes a log event in the kibana logs everytime the cache is called',
      category: ['crossClusterCache'],
      order: 3,
      type: 'boolean',
      value: false,
      requiresPageReload: false,
      schema: schema.boolean(),
    },
  });
};
