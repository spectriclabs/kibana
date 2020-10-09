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
    value: "glasbey_bw",
    text: "glasbey_bw",
    inputDisplay: "glasbey_bw",
  },
  {
    value: "glasbey",
    text: "glasbey",
    inputDisplay: "glasbey",
  },
  {
    value: "glasbey_cool",
    text: "glasbey_cool",
    inputDisplay: "glasbey_cool",
  },
  {
    value: "glasbey_warm",
    text: "glasbey_warm",
    inputDisplay: "glasbey_warm",
  },
  {
    value: "glasbey_dark",
    text: "glasbey_dark",
    inputDisplay: "glasbey_dark",
  },
  {
    value: "glasbey_category10",
    text: "glasbey_category10",
    inputDisplay: "glasbey_category10",
  },
  {
    value: "glasbey_hv",
    text: "glasbey_hv",
    inputDisplay: "glasbey_hv",
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

const numericModeOptions = [
  {
    value: "categorical",
    text: "Categorical"
  },
  {
    value: "histogram",
    text: "Histogram"
  },
  {
    value: "ramp",
    text: "Ramp"
  }
];

const renderModeOptions = [
  {
    value: "points",
    text: "Points"
  },
  {
    value: "ellipses",
    text: "Ellipses"
  },
  {
    value: "tracks",
    text: "Tracks"
  }
];

const spreadRangeOptions = [
  {
    value: "auto",
    text: "Automatic"
  },
  {
    value: "large",
    text: "Large"
  },
  {
    value: "medium",
    text: "Medium"
  },
  {
    value: "small",
    text: "Small"
  },
];

const thicknessRangeOptions = [
  {
    value: 0,
    text: "Thin"
  },
  {
    value: 1,
    text: "Medium"
  },
  {
    value: 3,
    text: "Thick"
  },
]

const gridResolutionOptions = [
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


const pointModeOptions = [
  {
    value: "heat",
    text: "By Density"
  },
  {
    value: "category",
    text: "By Value"
  }
];

const ellipseModeOptions = [
  {
    value: "heat",
    text: "One Color"
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

const trackSearchDistance = [
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
    this.onRenderModeChange = this.onRenderModeChange.bind(this);
    this.onResolutionChange = this.onResolutionChange.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onNumericModeChanged = this.onNumericModeChanged.bind(this);
    this.onCategoryFieldChange = this.onCategoryFieldChange.bind(this);
    this.onEllipseMajorChange = this.onEllipseMajorChange.bind(this);
    this.onEllipseMinorChange = this.onEllipseMinorChange.bind(this);
    this.onEllipseTiltChange = this.onEllipseTiltChange.bind(this);
    this.onEllipseUnitsChange = this.onEllipseUnitsChange.bind(this);
    this.onEllipseSearchDistanceChange = this.onEllipseSearchDistanceChange.bind(this);
    this.onEllipseThicknessChange = this.onEllipseThicknessChange.bind(this);
    this.onTrackChange = this.onTrackChange.bind(this);
    this.onTrackSearchDistanceChange = this.onTrackSearchDistanceChange.bind(this);
    this.onTrackThicknessChange = this.onTrackThicknessChange.bind(this);
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
      let _field = await field._getField();
      if (_field !== undefined) {
        return {
          label: await field.getLabel(),
          type: await field.getDataType(),
          pattern: _field.format ? _field.format.param("pattern") : null,
          name: field.getName(),
          origin: field.getOrigin(),
        };
      } else {
        return null;
      }
    };

    const categoryFields = await this.props.layer.getCategoricalFields();
    const categoryFieldPromises = categoryFields.map(getFieldMeta);
    const categoryFieldsArray = (await Promise.all(categoryFieldPromises)).filter((f) => (f !== null));
    if (this._isMounted && !_.isEqual(categoryFieldsArray, this.state.categoryFields)) {
      this.setState({ categoryFields: categoryFieldsArray });
    }

    const numberFields = await this.props.layer.getNumberFields();
    const numberFieldPromises = numberFields.map(getFieldMeta);
    const numberFieldsArray = (await Promise.all(numberFieldPromises)).filter((f) => (f !== null));
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

  onEllipseThicknessChange(e) {
    this.props.handlePropertyChange(
      "ellipseThickness",
      e.target.value
    );
  };

  onTrackThicknessChange(e) {
    this.props.handlePropertyChange(
      "trackThickness",
      e.target.value
    );
  };

  onResolutionChange(e) {
    this.props.handlePropertyChange(
      "gridResolution",
      e.target.value
    );
  };

  onRenderModeChange(e) {
    this.props.handlePropertyChange(
      "renderMode",
      e.target.value
    );
    if (this.props.showEllipses !== undefined) {
      this.props.handlePropertyChange(
        "showEllipses",
        undefined
      );
    }
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
    this.props.handlePropertyChange(
      "categoryFieldPattern",
      e.field.pattern
    );
    if (this.props.properties.numericMode === undefined) {
      this.props.properties.numericMode = (this.props.properties.categoryFieldType === "number") ? "histogram": "categorical";
    } else {
      this.props.properties.numericMode = "categorical";
    }
  };

  onNumericModeChanged(e) {
    this.props.handlePropertyChange(
      "numericMode",
      e.target.value
    );
    if (this.props.useHistogram !== undefined) {
      this.props.handlePropertyChange(
        "useHistogram",
        undefined
      );
    }
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

  onTrackChange(e) {
    this.props.handlePropertyChange(
      "trackField",
      e.field.name
    );
  };

  onTrackSearchDistanceChange(e) {
    this.props.handlePropertyChange(
      "trackSearchDistance",
      e.target.value
    );
  };

  _renderStyleConfiguration() {
    const renderModeRow = (
      <EuiFormRow
        label={'Render Mode'}
        display="rowCompressed"
      >
        <EuiSelect label="Render mode"
            options={renderModeOptions}
            value={this.props.properties.renderMode}
            onChange={this.onRenderModeChange}
        />
      </EuiFormRow>
    );

    const pointStyleConfiguration = (
      <Fragment>
        <EuiFormRow label="Dynamic Range" display="rowCompressed">
        <EuiSelect label="Span Range"
            options={spanRangeOptions}
            value={this.props.properties.spanRange}
            onChange={this.onSpanChange}
        />
        </EuiFormRow>
        <EuiFormRow label="Point Size" display="rowCompressed">
          <EuiSelect label="Point Size"
              options={spreadRangeOptions}
              value={this.props.properties.spread}
              onChange={this.onSpreadChange}
          />
        </EuiFormRow>
        <EuiFormRow label="Grid resolution" display="rowCompressed">
        <EuiSelect label="Grid resolution"
            options={gridResolutionOptions}
            value={this.props.properties.gridResolution}
            onChange={this.onResolutionChange}
          />
        </EuiFormRow>        
      </Fragment>
    );

    const ellipseStyleConfiguration = (
      <Fragment>
        <EuiFormRow label="Dynamic Range" display="rowCompressed">
        <EuiSelect label="Span Range"
            options={spanRangeOptions}
            value={this.props.properties.spanRange}
            onChange={this.onSpanChange}
        />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Thickness"}
          display="rowCompressed"
        >
          <EuiSelect label="Ellipse Thickness"
              options={thicknessRangeOptions}
              value={this.props.properties.ellipseThickness}
              onChange={this.onEllipseThicknessChange}
          />
        </EuiFormRow>
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

    const trackStyleConfiguration = (
      <Fragment>
        <EuiFormRow
          label={"Track Thickness"}
          display="rowCompressed"
        >
          <EuiSelect label="Track Thickness"
              options={thicknessRangeOptions}
              value={this.props.properties.trackThickness}
              onChange={this.onTrackThicknessChange}
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Track Connection"}
          display="columnCompressed"
        >
           <FieldSelect
            fields={this.state.numberFields}
            selectedFieldName={this.props.properties.trackField}
            onChange={this.onTrackChange}
            compressed
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Track Search Distance"}
          display="columnCompressed"
        >
          <EuiSelect label="Track Search Distance"
              options={trackSearchDistance}
              value={this.props.properties.trackSearchDistance}
              onChange={this.onTrackSearchDistanceChange}
          />
        </EuiFormRow>
      </Fragment>
    );

    if (this.props.properties.renderMode === "points") {
      return (
        <Fragment>
          {renderModeRow}
          {pointStyleConfiguration}
        </Fragment>
      );
    } else if (this.props.properties.renderMode === "ellipses") {
      return (
        <Fragment>
          {renderModeRow}
          {ellipseStyleConfiguration}
        </Fragment>
      );
    } else if (this.props.properties.renderMode === "tracks") {
      return (
        <Fragment>
          {renderModeRow}
          {trackStyleConfiguration}
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {renderModeRow}
        </Fragment>
      );
    }

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
    const numericDisabled = (
      this.props.properties.categoryFieldType !== "number" &&
      this.props.properties.categoryFieldType !== "date"
    );

    let numericModeSelect = "";
    if (!numericDisabled) {
      numericModeSelect = (
        <Fragment>
          <EuiFormRow
            label={'Numeric Mode'}
            display="rowCompressed"
          >
            <EuiSelect label="Numeric Mode"
                options={numericModeOptions}
                value={this.props.properties.numericMode}
                onChange={this.onNumericModeChanged}
            />
          </EuiFormRow>
        </Fragment>
      );
    }

    let colorSelect = "";
    if (this.props.properties.numericMode === "ramp") {
      colorSelect = (
        <Fragment>
          <EuiFormRow label={DATASHADER_COLOR_RAMP_LABEL} display="rowCompressed">
            <EuiSuperSelect
              options={colorRampOptions}
              onChange={this.onColorRampChange}
              valueOfSelected={this.props.properties.colorRampName}
              hasDividers={true}
              compressed
            />
          </EuiFormRow>
        </Fragment>
      );
    } else {
      colorSelect = (
        <Fragment>
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
      );
    }

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
        {colorSelect}
        {numericModeSelect}
      </Fragment>
    );
  }

  _renderColorStyleConfiguration() {
    let colorModeOptions;
    if (!this.props.properties.renderMode === "points") {
      colorModeOptions = pointModeOptions;
    } else {
      colorModeOptions = ellipseModeOptions;
    }

    const modeSwitch = (
      <EuiSelect label="Color Mode"
        options={colorModeOptions}
        value={this.props.properties.mode}
        onChange={this.onModeChange}
      />
    )

    if ((this.props.properties.mode === "heat")) {
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


        {this._renderColorStyleConfiguration()}
        <EuiHorizontalRule margin="xs" />
        {this._renderStyleConfiguration()}
      </Fragment>
    );
  }
}
