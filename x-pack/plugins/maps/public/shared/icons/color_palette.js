/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import classNames from 'classnames';
import { createColorPalette } from 'ui/vis/components/color/color_palette';

const NUM_COLORS = 7;

export const ColorPalette = () => {

  const classes = classNames('fa', 'fa-circle');
  const colors = createColorPalette(NUM_COLORS).slice(0, NUM_COLORS);

  return (
    <div className="mapColorPalette">
      {colors.map((color, index) => {
        return <i key={index} className={classes} style={{ color }}/>;
      })}
    </div>
  );
};
