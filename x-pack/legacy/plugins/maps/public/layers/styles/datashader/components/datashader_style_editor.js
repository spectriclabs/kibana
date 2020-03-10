/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';

import { EuiFormRow, EuiSuperSelect, EuiRange, EuiSelect, EuiFieldText } from '@elastic/eui';

import {
  DEFAULT_RGB_DATASHADER_COLOR_RAMP,
  DEFAULT_DATASHADER_COLOR_RAMP_NAME,
  DATASHADER_COLOR_RAMP_LABEL,
} from './datashader_constants';

export function DatashaderStyleEditor({ properties, handlePropertyChange }) {
  const onColorRampChange = selectedColorRampName => {
    handlePropertyChange(
      "colorRampName",
      selectedColorRampName
    );
  };

  const onSpreadChange = e => {
    handlePropertyChange(
      "spread",
      e.target.value
    );
  };

  const onSpanChange = e => {
    handlePropertyChange(
      "spanRange",
      e.target.value
    );
  };

  const onModeChange = e => {
    handlePropertyChange(
      "mode",
      e.target.value
    );
  };

  const onCategoryFieldChange = e => {
    handlePropertyChange(
      "categoryField",
      e.target.value
    );
  };

  const colorRampOptions = [
    {
      value: DEFAULT_DATASHADER_COLOR_RAMP_NAME,
      text: DEFAULT_DATASHADER_COLOR_RAMP_NAME,
      inputDisplay: DEFAULT_DATASHADER_COLOR_RAMP_NAME,
    },
    {
      value: "fire",
      text: "fire",
      inputDisplay: "fire",
    },
  ];

  const spanRangeOptions = [
    {
      value: "auto",
      text: "Automatic"
    },
    {
      value: "narrow",
      text: "Narrow"
    },
    {
      value: "normal",
      text: "Normal"
    },
    {
      value: "wide",
      text: "Wide"
    },
  ];

  const modeOptions = [
    {
      value: "heat",
      text: "Heat"
    },
    {
      value: "category",
      text: "Category"
    }
  ];

  return (
    <Fragment>
      <EuiFormRow label={DATASHADER_COLOR_RAMP_LABEL} display="rowCompressed">
        <EuiSuperSelect
          options={colorRampOptions}
          onChange={onColorRampChange}
          valueOfSelected={properties.colorRampName}
          hasDividers={true}
          compressed
        />
      </EuiFormRow>
      <EuiFormRow label="Spread" display="rowCompressed">
        <EuiRange
          onChange={onSpreadChange}
          value={properties.spread}
          showValue={true}
          showLabels={true}
          min={-1}
          max={10}
        />
      </EuiFormRow>
      <EuiSelect label="Span Range"
          options={spanRangeOptions}
          value={properties.spanRange}
          onChange={onSpanChange}
      />
      <EuiSelect label="Mode"
          options={modeOptions}
          value={properties.mode}
          onChange={onModeChange}
      />
      <EuiFieldText
          value={properties.categoryField}
          onChange={onCategoryFieldChange}
      />
    </Fragment>
  );
}
