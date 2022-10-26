/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import React, { ChangeEvent, Component, Fragment } from 'react';
import { EuiFormRow, EuiSuperSelect, EuiSelect, EuiSwitch, EuiSwitchEvent, EuiHorizontalRule } from '@elastic/eui';

import {  getIndexPatternService } from '../../../../kibana_services';
import { SingleFieldSelect } from '../../../../components/single_field_select';
import { IField } from '../../../fields/field';

import {
  DATASHADER_STYLES,
  FIELD_ORIGIN,
} from '../../../../../common/constants';

import {
  DATASHADER_COLOR_KEY_LABEL,
  DATASHADER_COLOR_RAMP_LABEL,
} from './datashader_constants';

import { DatashaderLayer } from '../../../layers/datashader_layer/datashader_layer';
import { DatashaderStylePropertiesDescriptor } from '../../../../../common/descriptor_types/style_property_descriptor_types';

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

interface FieldMeta {
  label: string;
  type: string;
  pattern: any;
  name: string;
  origin: FIELD_ORIGIN;
}

interface Props {
  handlePropertyChange: (settings: Partial<DatashaderStylePropertiesDescriptor>) => void;
  layer: DatashaderLayer;
  properties: DatashaderStylePropertiesDescriptor;
}

interface State {
  categoryFields: FieldMeta[];
  numberFields: FieldMeta[];
}

export class DatashaderStyleEditor extends Component<Props, State> {
  _isMounted = false;
  
  state = {
    categoryFields: [],
    numberFields: [],
  }

  constructor(props: Props) {
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
    const getFieldMeta = async (field: IField): Promise<FieldMeta> => {
      const formatter = await this.props.layer.getSource().getFieldFormatter(field);
      const indexPattern = await getIndexPatternService().get(this.props.layer.getIndexPatternIds()[0]);
      const fieldMeta = indexPattern.getFieldByName(field.getName());
      let pattern = fieldMeta?.spec.format ? fieldMeta?.spec.format.params?.pattern : null;

      if (!pattern && formatter) {
        pattern = formatter.getParamDefaults().pattern
      }

      return {
        label: await field.getLabel(),
        type: await field.getDataType(),
        pattern: pattern,
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

  onColorRampChange(selectedColorRampName: string) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.COLOR_RAMP_NAME]: selectedColorRampName }
    );
  }

  onColorKeyChange(selectedColorKeyName: string) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.COLOR_KEY_NAME]: selectedColorKeyName }
    );
  }

  onSpreadChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.SPREAD]: event.target.value }
    );
  }

  onThicknessChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.ELLIPSE_THICKNESS]: Number(event.target.value) }
    );
  }

  onResolutionChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.GRID_RESOLUTION]: event.target.value }
    );
  }

  onSpanChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.SPAN_RANGE]: event.target.value }
    );
  }

  onModeChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.MODE]: event.target.value }
    );
  }

  onCategoryFieldChange(fieldName?: string) {
    if (!fieldName) {
      return;
    }

    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.CATEGORY_FIELD]: fieldName }
    );

    const field = _.find(this.state.categoryFields, (o: FieldMeta) => (o.name === fieldName));
    
    if (field) {
      this.props.handlePropertyChange(
        { [DATASHADER_STYLES.CATEGORY_FIELD_TYPE]: field.type }
      );
      this.props.handlePropertyChange(
        { [DATASHADER_STYLES.CATEGORY_FIELD_PATTERN]: field.pattern }
      );

      let useHistogram: boolean = false;

      if (this.props.properties.useHistogram === undefined) {
        useHistogram = (field.type === "number");
      }

      this.props.handlePropertyChange(
        { [DATASHADER_STYLES.USE_HISTOGRAM]: useHistogram }
      );
    }
  };

  onShowEllipsesChanged(event: EuiSwitchEvent) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.SHOW_ELLIPSES]: event.target.checked }
    );
  };

  onUseHistogramChanged(event: EuiSwitchEvent) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.USE_HISTOGRAM]: event.target.checked }
    );
  };

  onEllipseMajorChange(fieldName?: string) {
    if (fieldName) {
      this.props.handlePropertyChange(
        { [DATASHADER_STYLES.ELLIPSE_MAJOR_FIELD]: fieldName }
      );
    }
  };

  onEllipseMinorChange(fieldName?: string) {
    if (fieldName) {
      this.props.handlePropertyChange(
        { [DATASHADER_STYLES.ELLIPSE_MINOR_FIELD]: fieldName }
      );
    }
  };

  onEllipseTiltChange(fieldName?: string) {
    if (fieldName) {
      this.props.handlePropertyChange(
        { [DATASHADER_STYLES.ELLIPSE_TILT_FIELD]: fieldName }
      );
    }
  };

  onEllipseUnitsChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.ELLIPSE_UNITS]: event?.target.value }
    );
  };

  onEllipseSearchDistanceChange(event: ChangeEvent<HTMLSelectElement>) {
    this.props.handlePropertyChange(
      { [DATASHADER_STYLES.ELLIPSE_SEARCH_DISTANCE]: event.target.value }
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
        <EuiSelect
            options={spanRangeOptions}
            value={this.props.properties.spanRange}
            onChange={this.onSpanChange}
        />
        </EuiFormRow>
        <EuiFormRow label="Point Size" display="rowCompressed">
          <EuiSelect
              options={spreadRangeOptions}
              value={this.props.properties.spread}
              onChange={this.onSpreadChange}
          />
        </EuiFormRow>
        <EuiFormRow label="Grid resolution" display="rowCompressed">
        <EuiSelect
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
        <EuiSelect
            options={spanRangeOptions}
            value={this.props.properties.spanRange}
            onChange={this.onSpanChange}
        />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Thickness"}
          display="rowCompressed"
        >
          <EuiSelect
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
          <EuiSelect
              options={ellipseUnitsOptions}
              value={this.props.properties.ellipseUnits}
              onChange={this.onEllipseUnitsChange}
          />
        </EuiFormRow>
        <EuiFormRow
          label={"Ellipse Search Distance"}
          display="columnCompressed"
        >
          <EuiSelect
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
    const useHistogram = this.props.properties.useHistogram !== undefined ? this.props.properties.useHistogram : false;
    let histogramChecked = (isNumeric && useHistogram);

    let histogramSwitch = (<Fragment></Fragment>);
    let colorOptions;

    if (isNumeric) {
      // migrate legacy configurations
      if (this.props.properties.useHistogram === undefined) {
        this.props.handlePropertyChange({ [DATASHADER_STYLES.USE_HISTOGRAM]: true });
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
      <EuiSelect
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
