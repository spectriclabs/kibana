/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { GRID_RESOLUTION } from '../../grid_resolution';
import { AbstractStyle } from '../abstract_style';
import { DatashaderStyleEditor } from './components/datashader_style_editor';
import { DatashaderLegend } from './components/legend/datashader_legend';
import {
    getDefaultProperties,
} from './datashader_style_defaults';
import { DEFAULT_DATASHADER_COLOR_RAMP_NAME } from './components/datashader_constants';
import { LAYER_STYLE_TYPE } from '../../../../common/constants';
import { getOrdinalColorRampStops } from '../color_utils';
import { i18n } from '@kbn/i18n';
import { EuiIcon } from '@elastic/eui';

export class DatashaderStyle extends AbstractStyle {
  static type = LAYER_STYLE_TYPE.DATASHADER;

  constructor(descriptor = {}) {
    super();
    this._descriptor = DatashaderStyle.createDescriptor(descriptor.properties);
  }

  static createDescriptor(properties = {}, isTimeAware = true) {
    return {
      type: DatashaderStyle.type,
      properties: { ...getDefaultProperties(), ...properties },
    };
  }

  static getDisplayName() {
    return i18n.translate('xpack.maps.style.datashader.displayNameLabel', {
      defaultMessage: 'Datashader style',
    });
  }

  getRawProperties() {
    return this._descriptor.properties || {};
  }

  renderEditor({ onStyleDescriptorChange }) {
    const rawProperties = this.getRawProperties();
    const handlePropertyChange = (propertyName, settings) => {
      rawProperties[propertyName] = settings; //override single property, but preserve the rest
      const datashaderStyleDescriptor = DatashaderStyle.createDescriptor(rawProperties);
      onStyleDescriptorChange(datashaderStyleDescriptor);
    };

    return (
      <DatashaderStyleEditor
        properties={this._descriptor.properties}
        handlePropertyChange={handlePropertyChange}
      />
    );
  }

  renderLegendDetails(sourceDescriptor) {
    return <DatashaderLegend styleDescriptor={this._descriptor} sourceDescriptor={sourceDescriptor} />;
  }

  getIcon() {
    return <EuiIcon size="m" type="datashader" />;
  }

  getStyleUrlParams() {
    let urlParams = "";

    return urlParams.concat(
        "&cmap=", this._descriptor.properties.colorRampName,
        "&spread=", this._descriptor.properties.spread,
        "&span=", this._descriptor.properties.spanRange,
        "&mode=", this._descriptor.properties.mode,
        "&category_field=", this._descriptor.properties.categoryField
    )
  }
}
