/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';

import { EuiFormRow, EuiSuperSelect, EuiRange, EuiSelect, EuiFieldText, EuiSwitch, EuiHorizontalRule } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import {
  DEFAULT_RGB_DATASHADER_COLOR_RAMP,
  DEFAULT_DATASHADER_COLOR_RAMP_NAME,
  DATASHADER_COLOR_RAMP_LABEL,
  DEFAULT_DATASHADER_COLOR_KEY_NAME,
  DATASHADER_COLOR_KEY_LABEL,
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
  {
    value: "colorwheel",
    text: "colorwheel",
    inputDisplay: "colorwheel",
  },
  {
    value: "isolum",
    text: "isolum",
    inputDisplay: "isolum",
  },
  {
    value: "gray",
    text: "gray",
    inputDisplay: "gray",
  },
  {
    value: "bkr",
    text: "bkr",
    inputDisplay: "bkr",
  },
  {
    value: "bgy",
    text: "bgy",
    inputDisplay: "bgy",
  },
  {
    value: "dimgray",
    text: "dimgray",
    inputDisplay: "dimgray",
  },
  {
    value: "bky",
    text: "bky",
    inputDisplay: "bky",
  },
  {
    value: "bgyw",
    text: "bgyw",
    inputDisplay: "bgyw",
  },
  {
    value: "coolwarm",
    text: "coolwarm",
    inputDisplay: "coolwarm",
  },
  {
    value: "kbc",
    text: "kbc",
    inputDisplay: "kbc",
  },
  {
    value: "kb",
    text: "kb",
    inputDisplay: "kb",
  },
  {
    value: "gwv",
    text: "gwv",
    inputDisplay: "gwv",
  },
  {
    value: "blues",
    text: "blues",
    inputDisplay: "blues",
  },
  {
    value: "kg",
    text: "kg",
    inputDisplay: "kg",
  },
  {
    value: "bjy",
    text: "bjy",
    inputDisplay: "bjy",
  },
  {
    value: "bmw",
    text: "bmw",
    inputDisplay: "bmw",
  },
  {
    value: "kr",
    text: "kr",
    inputDisplay: "kr",
  },
  {
    value: "bwm",
    text: "bwm",
    inputDisplay: "bwm",
  },
  {
    value: "rainbow",
    text: "rainbow",
    inputDisplay: "rainbow",
  },
  {
    value: "cwr",
    text: "cwr",
    inputDisplay: "cwr",
  },
  {
    value: "kgy",
    text: "kgy",
    inputDisplay: "kgy",
  },
];

const colorKeyOptions = [
  {
    value: DEFAULT_DATASHADER_COLOR_KEY_NAME,
    text: DEFAULT_DATASHADER_COLOR_KEY_NAME,
    inputDisplay: DEFAULT_DATASHADER_COLOR_KEY_NAME,
  },
  {
    value: "glasby_bw",
    text: "glasby_bw",
    inputDisplay: "glasby_bw",
  },
  {
    value: "glasby",
    text: "glasby",
    inputDisplay: "glasby",
  },
  {
    value: "glasby_cool",
    text: "glasby_cool",
    inputDisplay: "glasby_cool",
  },
  {
    value: "glasby_warm",
    text: "glasby_warm",
    inputDisplay: "glasby_warm",
  },
  {
    value: "glasby_dark",
    text: "glasby_dark",
    inputDisplay: "glasby_dark",
  },
  {
    value: "glasby_category10",
    text: "glasby_category10",
    inputDisplay: "glasby_category10",
  },
  {
    value: "glasby_hv",
    text: "glasby_hv",
    inputDisplay: "glasby_hv",
  },
];

const spanRangeOptions = [
  {
    value: "auto",
    text: "Automatic (slower)"
  },
  {
    value: "flat",
    text: "Flat"
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

const spreadRangeOptions = [
  {
    value: "auto",
    text: "Automatic"
  },
  {
    value: "coarse",
    text: "Coarse"
  },
  {
    value: "fine",
    text: "Fine"
  },
  {
    value: "finest",
    text: "Finest"
  },
];

const modeOptions = [
  {
    value: "heat",
    text: "By Density"
  },
  {
    value: "category",
    text: "By Value"
  }
];

const ellipseUnitsOptions = [
  {
    value: "semi_majmin_nm",
    text: "Semi Major/Minor (nm)"
  },
  {
    value: "semi_majmin_m",
    text: "Semi Major/Minor (m)"
  },
  {
    value: "majmin_nm",
    text: "Major/Minor (nm)"
  },
  {
    value: "majmin_m",
    text: "Major/Minor (m)"
  },
];

const ellipseSearchDistance = [
  {
    value: "narrow",
    text: "Narrow (1 nm)"
  },
  {
    value: "normal",
    text: "Normal (10 nm)"
  },
  {
    value: "wide",
    text: "Wide (50 nm)"
  },
];

export class DatashaderStyleEditor extends Component {
  state = {
    categoryFields: [],
    numberFields: [],
  }

  constructor(props) {
    super(props);
    this.onColorRampChange = this.onColorRampChange.bind(this);
    this.onColorKeyChange = this.onColorKeyChange.bind(this);
    this.onSpreadChange = this.onSpreadChange.bind(this);
    this.onSpanChange = this.onSpanChange.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onCategoryFieldChange = this.onCategoryFieldChange.bind(this);
    this.onShowEllipsesChanged = this.onShowEllipsesChanged.bind(this);
    this.onEllipseMajorChange = this.onEllipseMajorChange.bind(this);
    this.onEllipseMinorChange = this.onEllipseMinorChange.bind(this);
    this.onEllipseTiltChange = this.onEllipseTiltChange.bind(this);
    this.onEllipseUnitsChange = this.onEllipseUnitsChange.bind(this);
    this.onEllipseSearchDistanceChange = this.onEllipseSearchDistanceChange.bind(this);
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
        type: await field.getDataType(),
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

    const numberFields = await this.props.layer.getNumberFields();
    const numberFieldPromises = numberFields.map(getFieldMeta);
    const numberFieldsArray = await Promise.all(numberFieldPromises);
    if (this._isMounted && !_.isEqual(numberFieldsArray, this.state.numberFields)) {
      this.setState({ numberFields: numberFieldsArray });
    }
  }

  onColorRampChange(selectedColorRampName) {
    this.props.handlePropertyChange(
      "colorRampName",
      selectedColorRampName
    );
  };

  onColorKeyChange(selectedColorKeyName) {
    this.props.handlePropertyChange(
      "colorKeyName",
      selectedColorKeyName
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
      e.field.name
    );
    this.props.handlePropertyChange(
      "categoryFieldType",
      e.field.type
    );
  };

  onShowEllipsesChanged(e) {
    this.props.handlePropertyChange(
      "showEllipses",
      e.target.checked
    );
  };

  onEllipseMajorChange(e) {
    this.props.handlePropertyChange(
      "ellipseMajorField",
      e.field.name
    );
  };

  onEllipseMinorChange(e) {
    this.props.handlePropertyChange(
      "ellipseMinorField",
      e.field.name
    );
  };

  onEllipseTiltChange(e) {
    this.props.handlePropertyChange(
      "ellipseTiltField",
      e.field.name
    );
  };

  onEllipseUnitsChange(e) {
    this.props.handlePropertyChange(
      "ellipseUnits",
      e.target.value
    );
  };

  onEllipseSearchDistanceChange(e) {
    this.props.handlePropertyChange(
      "ellipseSearchDistance",
      e.target.value
    );
  };

  _renderEllipseStyleConfiguration() {
    const ellipsesSwitch = (
      <EuiFormRow
        label={'Ellipses'}
        display="columnCompressed"
      >
        <EuiSwitch
          label={'Show ellipses'}
          checked={this.props.properties.showEllipses}
          onChange={this.onShowEllipsesChanged}
          compressed
        />
      </EuiFormRow>
    );

    if (!this.props.properties.showEllipses) {
      return ellipsesSwitch;
    }

    return (
      <Fragment>
        {ellipsesSwitch}
        <EuiFormRow
          label={"Ellipse Major"}
          display="columnCompressed"
        >
           <FieldSelect
            fields={this.state.numberFields}
            selectedFieldName={this.props.properties.ellipseMajorField}
            onChange={this.onEllipseMajorChange}
            compressed
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Minor"}
          display="columnCompressed"
        >
          <FieldSelect
            fields={this.state.numberFields}
            selectedFieldName={this.props.properties.ellipseMinorField}
            onChange={this.onEllipseMinorChange}
            compressed
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Tilt"}
          display="columnCompressed"
        >
          <FieldSelect
            fields={this.state.numberFields}
            selectedFieldName={this.props.properties.ellipseTiltField}
            onChange={this.onEllipseTiltChange}
            compressed
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Units"}
          display="columnCompressed"
        >
          <EuiSelect label="Ellipse Units"
              options={ellipseUnitsOptions}
              value={this.props.properties.ellipseUnits}
              onChange={this.onEllipseUnitsChange}
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Search Distance"}
          display="columnCompressed"
        >
          <EuiSelect label="Ellipse Search Distance"
              options={ellipseSearchDistance}
              value={this.props.properties.ellipseSearchDistance}
              onChange={this.onEllipseSearchDistanceChange}
          />
        </EuiFormRow>
      </Fragment>
    );

  };

  _renderHeatColorStyleConfiguration() {
    return (
      <EuiFormRow label={DATASHADER_COLOR_RAMP_LABEL} display="rowCompressed">
        <EuiSuperSelect
          options={colorRampOptions}
          onChange={this.onColorRampChange}
          valueOfSelected={this.props.properties.colorRampName}
          hasDividers={true}
          compressed
        />
      </EuiFormRow>
    )
  }

  _renderCategoricalColorStyleConfiguration() {
    return (
      <Fragment>
        <EuiFormRow label="Value" display="rowCompressed">
          <FieldSelect
              fields={this.state.categoryFields}
              selectedFieldName={this.props.properties.categoryField}
              onChange={this.onCategoryFieldChange}
              compressed
          />
        </EuiFormRow>
        <EuiFormRow label={DATASHADER_COLOR_KEY_LABEL} display="rowCompressed">
          <EuiSuperSelect
            options={colorKeyOptions}
            onChange={this.onColorKeyChange}
            valueOfSelected={this.props.properties.colorKeyName}
            hasDividers={true}
            compressed
          />
        </EuiFormRow>
      </Fragment>
    )
  }

  _renderColorStyleConfiguration() {
    const modeSwitch = (
      <EuiSelect label="Color Mode"
        options={modeOptions}
        value={this.props.properties.mode}
        onChange={this.onModeChange}
      />
    )

    if (this.props.properties.mode === "heat") {
      return (
        <Fragment>
           <EuiFormRow label="Color" display="rowCompressed">
           {modeSwitch}
           </EuiFormRow>
           {this._renderHeatColorStyleConfiguration()}
        </Fragment>
      );
    } else {
      return (
        <Fragment>
           <EuiFormRow label="Color" display="rowCompressed">
           {modeSwitch}
           </EuiFormRow>
           {this._renderCategoricalColorStyleConfiguration()}
        </Fragment>
      );
    }

  }

  render() {
    return (
      <Fragment>
        <EuiFormRow label="Resolution" display="rowCompressed">
          <EuiSelect label="Point Spread"
              options={spreadRangeOptions}
              value={this.props.properties.spread}
              onChange={this.onSpreadChange}
          />
        </EuiFormRow>
        <EuiFormRow label="Dynamic Range" display="rowCompressed">
          <EuiSelect label="Span Range"
              options={spanRangeOptions}
              value={this.props.properties.spanRange}
              onChange={this.onSpanChange}
          />
        </EuiFormRow>

        <EuiHorizontalRule margin="xs" />
        {this._renderColorStyleConfiguration()}
        <EuiHorizontalRule margin="xs" />
        {this._renderEllipseStyleConfiguration()}
      </Fragment>
    );
  }
}
