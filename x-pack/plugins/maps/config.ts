/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema, TypeOf } from '@kbn/config-schema';

export interface DatashaderConfigType {
  url: string;
  defaultGeospatialField: string;
  defaultEllipseMajor: string;
  defaultEllipseMinor: string;
  defaultEllipseTilt: string;
}

export interface MapsConfigType {
  enabled: boolean;
  showMapVisualizationTypes: boolean;
  showMapsInspectorAdapter: boolean;
  preserveDrawingBuffer: boolean;
  datashader: DatashaderConfigType;
}

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
  showMapVisualizationTypes: schema.boolean({ defaultValue: false }),
  // flag used in functional testing
  showMapsInspectorAdapter: schema.boolean({ defaultValue: false }),
  // flag used in functional testing
  preserveDrawingBuffer: schema.boolean({ defaultValue: false }),
  datashader: schema.object({
    url: schema.string(),
    defaultGeospatialField: schema.string({ defaultValue: null }),
    defaultEllipseMajor: schema.string({ defaultValue: null }),
    defaultEllipseMinor: schema.string({ defaultValue: null }),
    defaultEllipseTilt: schema.string({ defaultValue: null })
  }),
});

export type MapsXPackConfig = TypeOf<typeof configSchema>;
