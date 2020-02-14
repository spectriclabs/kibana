/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { staticTimeShape } from '../style_option_shapes';
import { ValidatedRange } from '../../../../../components/validated_range';

export function StaticTimeSelection({ onChange, styleOptions }) {
  const onTimeChange = time => {
    onChange({ time });
  };

  return (
    <ValidatedRange
      min={0}
      max={360}
      value={styleOptions.time}
      onChange={onTimeChange}
      showInput
      showLabels
      compressed
      append="°"
    />
  );
}

StaticTimeSelection.propTypes = {
  styleOptions: staticTimeShape.isRequired,
  onChange: PropTypes.func.isRequired,
};
