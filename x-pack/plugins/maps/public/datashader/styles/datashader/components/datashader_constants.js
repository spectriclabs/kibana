/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';

export const DEFAULT_DATASHADER_COLOR_RAMP_NAME = 'bmy';

export const DEFAULT_DATASHADER_COLOR_KEY_NAME = 'glasbey_light';

export const DATASHADER_COLOR_RAMP_LABEL = i18n.translate('xpack.maps.heatmap.colorRampLabel', {
  defaultMessage: 'Color range',
});

export const DATASHADER_COLOR_KEY_LABEL = i18n.translate('xpack.maps.heatmap.colorKeyLabel', {
  defaultMessage: 'Color key',
});
