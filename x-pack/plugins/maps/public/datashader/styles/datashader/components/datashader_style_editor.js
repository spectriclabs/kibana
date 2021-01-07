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
} from '../../../../../common/constants';

import { SingleFieldSelect } from '../../../../components/single_field_select';
import {  getIndexPatternService } from '../../../../kibana_services';

function filterColorByField(field) {
  return ! [ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE].includes(field.type);
}

const colorRampOptions = [
  {
    value: "bmy",
    text: "bmy",
    inputDisplay: "bmy",
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
    value: 'glasbey_light',
    text: 'glasbey_light',
    inputDisplay: 'glasbey_light',
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
  {
    value: "hv",
    text: "hv",
    inputDisplay: "hv",
  },
  {
    value: "category10",
    text: "category10",
    inputDisplay: "category10",
  },
  {
    value: "kibana5",
    text: "kibana5",
    inputDisplay: "kibana5",
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
    this.onThicknessChange = this.onThicknessChange.bind(this);
    this.onResolutionChange = this.onResolutionChange.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onUseHistogramChanged = this.onUseHistogramChanged.bind(this);
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
      const indexPattern = await getIndexPatternService().get(this.props.layer.getIndexPatternIds()[0]);
      const field_meta = indexPattern.getFieldByName(field.getName());

      return {
        label: await field.getLabel(),
        type: await field.getDataType(),
        pattern: field_meta.format ? field_meta.format.param("pattern") : null,
        name: field.getName(),
        origin: field.getOrigin(),
      };
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

  onThicknessChange(e) {
    this.props.handlePropertyChange(
      "ellipseThickness",
      e.target.value
    );
  };

  onResolutionChange(e) {
    this.props.handlePropertyChange(
      "gridResolution",
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
      e
    );

    const field = _.find(this.state.categoryFields, (o) => (o.name === e));
    if (field) {
      this.props.handlePropertyChange(
        "categoryFieldType",
        field.type
      );
      this.props.handlePropertyChange(
        "categoryFieldPattern",
        field.DEFAULT_DATASHADER_COLOR_KEY_NAMEpattern
      );
      if (this.props.properties.useHistogram === undefined) {
        this.props.properties.useHistogram = (field.type === "number");
      } else {
        this.props.properties.useHistogram = false;
      }
    }
  };

  onShowEllipsesChanged(e) {
    this.props.handlePropertyChange(
      "showEllipses",
      e.target.checked
    );
  };

  onUseHistogramChanged(e) {
    this.props.handlePropertyChange(
      "useHistogram",
      e.target.checked
    );
  };

  onEllipseMajorChange(e) {
    this.props.handlePropertyChange(
      "ellipseMajorField",
      e
    );
  };

  onEllipseMinorChange(e) {
    this.props.handlePropertyChange(
      "ellipseMinorField",
      e
    );
  };

  onEllipseTiltChange(e) {
    this.props.handlePropertyChange(
      "ellipseTiltField",
      e
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

  _renderStyleConfiguration() {
    const ellipsesSwitch = (
      <EuiFormRow
        label={'Render Mode'}
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
              onChange={this.onThicknessChange}
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Major"}
          display="columnCompressed"
        >
           <SingleFieldSelect
            fields={this.state.numberFields}
            value={this.props.properties.ellipseMajorField}
            onChange={this.onEllipseMajorChange}
            compressed
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Minor"}
          display="columnCompressed"
        >
          <SingleFieldSelect
            fields={this.state.numberFields}
            value={this.props.properties.ellipseMinorField}
            onChange={this.onEllipseMinorChange}
            compressed
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Tilt"}
          display="columnCompressed"
        >
          <SingleFieldSelect
            fields={this.state.numberFields}
            value={this.props.properties.ellipseTiltField}
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

    if (!this.props.properties.showEllipses) {
      return (
        <Fragment>
          {ellipsesSwitch}
          {pointStyleConfiguration}
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {ellipsesSwitch}
          {ellipseStyleConfiguration}
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
    const isNumeric = (this.props.properties.categoryFieldType === "number");
    let histogramChecked = (isNumeric && this.props.properties.useHistogram);

    let histogramSwitch = "";
    let colorOptions;

    if (isNumeric) {
      // migrate legacy configurations
      if (this.props.properties.useHistogram === undefined) {
        this.props.handlePropertyChange(
          "useHistogram",
          true
        );
        histogramChecked = true;
      }

      colorOptions = _.concat(colorKeyOptions, colorRampOptions)

      histogramSwitch = (
        <Fragment>
          <EuiFormRow
            label={'Numeric Mode'}
            display="columnCompressed"
          >
            <EuiSwitch
              label={'Histogram Numeric Values'}
              checked={histogramChecked}
              onChange={this.onUseHistogramChanged}
              disabled={!isNumeric}
              compressed
            />
          </EuiFormRow>
        </Fragment>
      );
    } else {
      colorOptions = colorKeyOptions;
    }

    return (
      <Fragment>
        <EuiFormRow label="Value" display="rowCompressed">
          <SingleFieldSelect
              fields={this.state.categoryFields}
              value={this.props.properties.categoryField}
              onChange={this.onCategoryFieldChange}
              compressed
          />
        </EuiFormRow>
        <EuiFormRow label={DATASHADER_COLOR_KEY_LABEL} display="rowCompressed">
          <EuiSuperSelect
            options={colorOptions}
            onChange={this.onColorKeyChange}
            valueOfSelected={this.props.properties.colorKeyName}
            hasDividers={true}
            compressed
          />
        </EuiFormRow>
        {histogramSwitch}
      </Fragment>
    );
  }

  _renderColorStyleConfiguration() {
    let colorModeOptions;
    if (!this.props.properties.showEllipses) {
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


        {this._renderColorStyleConfiguration()}
        <EuiHorizontalRule margin="xs" />
        {this._renderStyleConfiguration()}
      </Fragment>
    );
  }
}
