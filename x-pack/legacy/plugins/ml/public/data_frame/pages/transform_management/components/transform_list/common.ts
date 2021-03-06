/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { idx } from '@kbn/elastic-idx';

import { Dictionary } from '../../../../../../common/types/common';

import { DataFrameTransformId, DataFrameTransformPivotConfig } from '../../../../common';

// reflects https://github.com/elastic/elasticsearch/blob/master/x-pack/plugin/core/src/main/java/org/elasticsearch/xpack/core/dataframe/transforms/DataFrameTransformStats.java#L243
export enum DATA_FRAME_TRANSFORM_STATE {
  ABORTING = 'aborting',
  FAILED = 'failed',
  INDEXING = 'indexing',
  STARTED = 'started',
  STOPPED = 'stopped',
  STOPPING = 'stopping',
}

export enum DATA_FRAME_MODE {
  BATCH = 'batch',
  CONTINUOUS = 'continuous',
}

export interface Clause {
  type: string;
  value: string;
  match: string;
}

export interface Query {
  ast: {
    clauses: Clause[];
  };
  text: string;
  syntax: any;
}

export interface DataFrameTransformStats {
  id: DataFrameTransformId;
  checkpointing: {
    last: {
      checkpoint: number;
      timestamp_millis?: number;
    };
    next?: {
      checkpoint: number;
      checkpoint_progress?: {
        total_docs: number;
        docs_remaining: number;
        percent_complete: number;
      };
    };
    operations_behind: number;
  };
  node?: {
    id: string;
    name: string;
    ephemeral_id: string;
    transport_address: string;
    attributes: Record<string, any>;
  };
  stats: {
    documents_indexed: number;
    documents_processed: number;
    index_failures: number;
    index_time_in_ms: number;
    index_total: number;
    pages_processed: number;
    search_failures: number;
    search_time_in_ms: number;
    search_total: number;
    trigger_count: number;
  };
  reason?: string;
  state: DATA_FRAME_TRANSFORM_STATE;
}

export function getTransformProgress(item: DataFrameTransformListRow) {
  if (isCompletedBatchTransform(item)) {
    return 100;
  }

  const progress = idx(item, _ => _.stats.checkpointing.next.checkpoint_progress.percent_complete);

  return progress !== undefined ? Math.round(progress) : undefined;
}

export function isDataFrameTransformStats(arg: any): arg is DataFrameTransformStats {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    {}.hasOwnProperty.call(arg, 'state') &&
    Object.values(DATA_FRAME_TRANSFORM_STATE).includes(arg.state)
  );
}

export interface DataFrameTransformListRow {
  id: DataFrameTransformId;
  config: DataFrameTransformPivotConfig;
  mode?: string; // added property on client side to allow filtering by this field
  stats: DataFrameTransformStats;
}

export interface DataFrameTransformEndpointRequest {
  id: DataFrameTransformId;
  state?: DATA_FRAME_TRANSFORM_STATE;
}

export interface ResultData {
  success: boolean;
  error?: any;
}

export interface DataFrameTransformEndpointResult {
  [key: string]: ResultData;
}

// Used to pass on attribute names to table columns
export enum DataFrameTransformListColumn {
  configDestIndex = 'config.dest.index',
  configSourceIndex = 'config.source.index',
  description = 'config.description',
  id = 'id',
}

export type ItemIdToExpandedRowMap = Dictionary<JSX.Element>;

export function isCompletedBatchTransform(item: DataFrameTransformListRow) {
  // If `checkpoint=1`, `sync` is missing from the config and state is stopped,
  // then this is a completed batch data frame transform.
  return (
    item.stats.checkpointing.last.checkpoint === 1 &&
    item.config.sync === undefined &&
    item.stats.state === DATA_FRAME_TRANSFORM_STATE.STOPPED
  );
}
