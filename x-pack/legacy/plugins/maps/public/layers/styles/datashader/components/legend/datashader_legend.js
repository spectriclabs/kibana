/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';

import { i18n } from '@kbn/i18n';
import { ColorGradient } from '../../../components/color_gradient';
import { RangedStyleLegendRow } from '../../../components/ranged_style_legend_row';
import {
  DEFAULT_RGB_DATASHADER_COLOR_RAMP,
  DEFAULT_DATASHADER_COLOR_RAMP_NAME,
  DATASHADER_COLOR_RAMP_LABEL,
} from '../datashader_constants';

export class DatashaderLegend extends React.Component {
  constructor() {
    super();
    this.state = { label: '' };
  }

  componentDidUpdate() {
    this._loadLabel();
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadLabel();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  async _loadLabel() {
    const label = await this.props.field.getLabel();
    if (this._isMounted && this.state.label !== label) {
      this.setState({ label });
    }
  }

  render() {
    const colorRampName = this.props.colorRampName;
    const header =
      colorRampName === DEFAULT_DATASHADER_COLOR_RAMP_NAME ? (
        <ColorGradient colorRamp={DEFAULT_RGB_DATASHADER_COLOR_RAMP} />
      ) : (
        <ColorGradient colorRampName={colorRampName} />
      );

    return (
      <RangedStyleLegendRow
        header={header}
        minLabel={i18n.translate('xpack.maps.datashaderLegend.coldLabel', {
          defaultMessage: 'cold',
        })}
        maxLabel={i18n.translate('xpack.maps.datashaderLegend.hotLabel', {
          defaultMessage: 'hot',
        })}
        propertyLabel={DATASHADER_COLOR_RAMP_LABEL}
        fieldLabel={this.state.label}
      />
    );
  }
}
