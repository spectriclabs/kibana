/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';

import { EuiFormRow, EuiSuperSelect, EuiRange, EuiSelect, EuiFieldText } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import {
  DEFAULT_RGB_DATASHADER_COLOR_RAMP,
  DEFAULT_DATASHADER_COLOR_RAMP_NAME,
  DATASHADER_COLOR_RAMP_LABEL,
} from './datashader_constants';

import {
  ES_GEO_FIELD_TYPE
} from '../../../../../../maps/common/constants';

import { FieldSelect } from '../../../../../../maps/public/layers/styles/vector/components/field_select';
import { isNestedField } from '../../../../../../../../../src/plugins/data/public';

function filterColorByField(field) {
  return ! [ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE].includes(field.type);
}

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

export class DatashaderStyleEditor extends Component {
  state = {
    categoryFields: [],
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadFields();
  }

  componentDidUpdate() {
    this._loadFields();
  }

  async _loadFields() {
    const getFieldMeta = async field => {
      return {
        label: await field.getLabel(),
        name: field.getName(),
        origin: field.getOrigin(),
      };
    };

    const categoryFields = await this.props.layer.getCategoricalFields();
    const categoryFieldPromises = categoryFields.map(getFieldMeta);
    const categoryFieldsArray = await Promise.all(categoryFieldPromises);
    if (this._isMounted && !_.isEqual(categoryFieldsArray, this.state.categoryFields)) {
      this.setState({ categoryFields: categoryFieldsArray });
    }
  }

  onColorRampChange(selectedColorRampName) {
    this.props.handlePropertyChange(
      "colorRampName",
      selectedColorRampName
    );
  };

  onSpreadChange(e) {
    this.props.handlePropertyChange(
      "spread",
      e.target.value
    );
  };

  onSpanChange(e) {
    this.props.handlePropertyChange(
      "spanRange",
      e.target.value
    );
  };

  onModeChange(e) {
    this.props.handlePropertyChange(
      "mode",
      e.target.value
    );
  };

  onCategoryFieldChange(e) {
    this.props.handlePropertyChange(
      "categoryField",
      e.target.value
    );
  };

  render() {
    return (
      <Fragment>
        <EuiFormRow label={DATASHADER_COLOR_RAMP_LABEL} display="rowCompressed">
          <EuiSuperSelect
            options={colorRampOptions}
            onChange={this.onColorRampChange}
            valueOfSelected={this.props.colorRampName}
            hasDividers={true}
            compressed
          />
        </EuiFormRow>
        <EuiFormRow label="Spread" display="rowCompressed">
          <EuiRange
            onChange={this.onSpreadChange}
            value={this.props.spread}
            showValue={true}
            showLabels={true}
            min={-1}
            max={10}
          />
        </EuiFormRow>
        <EuiSelect label="Span Range"
            options={spanRangeOptions}
            value={this.props.spanRange}
            onChange={this.onSpanChange}
        />
        <EuiSelect label="Mode"
            options={modeOptions}
            value={this.props.mode}
            onChange={this.onModeChange}
        />
        <FieldSelect
            fields={this.state.categoryFields}
            selectedFieldName={this.props.categoryField}
            onChange={this.onCategoryFieldChange}
            compressed
        />
      </Fragment>
    );
  }
}
