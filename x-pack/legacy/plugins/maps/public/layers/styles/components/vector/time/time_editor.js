/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';

import { StaticDynamicStyleRow } from '../../../components/static_dynamic_style_row';
import { DynamicTimeSelection } from './dynamic_time_selection';
import { StaticTimeSelection } from './static_time_selection';
import { i18n } from '@kbn/i18n';

export function TimeEditor(props) {
  return (
    <StaticDynamicStyleRow
      ordinalFields={props.ordinalFields}
      property={props.styleProperty}
      label={i18n.translate('xpack.maps.styles.vector.timeLabel', {
        defaultMessage: 'Time'
      })}
      styleDescriptor={props.styleDescriptor}
      handlePropertyChange={props.handlePropertyChange}
      DynamicSelector={DynamicTimeSelection}
      StaticSelector={StaticTimeSelection}
      defaultDynamicStyleOptions={props.defaultDynamicStyleOptions}
      defaultStaticStyleOptions={props.defaultStaticStyleOptions}
    />
  );
}
