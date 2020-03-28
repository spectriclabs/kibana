/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { GRID_RESOLUTION } from '../../../../../maps/public/layers/grid_resolution';
import { AbstractStyle } from '../../../../../maps/public/layers/styles/abstract_style';
import { DatashaderStyleEditor } from './components/datashader_style_editor';
import { DatashaderLegend } from './components/legend/datashader_legend';
import {
    getDefaultProperties,
} from './datashader_style_defaults';
import { DEFAULT_DATASHADER_COLOR_RAMP_NAME } from './components/datashader_constants';
import { LAYER_STYLE_TYPE } from '../../../../../maps/common/constants';
import { getOrdinalColorRampStops } from '../../../../../maps/public/layers/styles/color_utils';
import { i18n } from '@kbn/i18n';
import { EuiIcon, EuiSpacer, EuiText, EuiFlexItem, EuiFlexGroup, EuiToolTip, EuiTextColor } from '@elastic/eui';
import { VectorIcon } from '../../../../../maps/public/layers/styles/vector/components/legend/vector_icon';

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

  renderEditor({ layer, onStyleDescriptorChange }) {
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
        layer={layer}
      />
    );
  }

  _renderStopIcon(color, isLinesOnly, isPointsOnly, symbolId) {
    const fillColor = color; //this.getStyleName() === VECTOR_STYLES.FILL_COLOR ? color : 'none';
    return (
      <VectorIcon
        fillColor={fillColor}
        isPointsOnly={isPointsOnly}
        isLinesOnly={isLinesOnly}
        strokeColor={color}
        symbolId={symbolId}
      />
    );
  }

  _renderColorbreaks({ isLinesOnly, isPointsOnly, symbolId, legend }) {
    let colorAndLabels = []
    for (let key in legend) {
        colorAndLabels.push({
            label: key,
            color: legend[key],
        });
    }

    const defaultColor = null;
    if (defaultColor) {
      colorAndLabels.push({
        label: <EuiTextColor color="secondary">OTHER</EuiTextColor>,
        color: defaultColor,
      });
    }

    return colorAndLabels.map((config, index) => {
      return (
        <EuiFlexItem key={index}>
          <EuiFlexGroup direction={'row'} gutterSize={'none'}>
            <EuiFlexItem>
              <EuiText size={'xs'}>{config.label}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {this._renderStopIcon(config.color, isLinesOnly, isPointsOnly, symbolId)}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      );
    });
  }

  getDisplayStyleName() {
    return "Category Field";
  }

  renderBreakedLegend({ fieldLabel, isPointsOnly, isLinesOnly, symbolId, legend }) {
    return (
      <div>
        <EuiSpacer size="s" />
        <EuiFlexGroup direction={'column'} gutterSize={'none'}>
          {this._renderColorbreaks({
            isPointsOnly,
            isLinesOnly,
            symbolId,
            legend
          })}
        </EuiFlexGroup>
        <EuiFlexGroup gutterSize="xs" justifyContent="spaceAround">
          <EuiFlexItem grow={false}>
            <EuiToolTip position="top" title={this.getDisplayStyleName()} content={fieldLabel}>
              <EuiText className="eui-textTruncate" size="xs" style={{ maxWidth: '180px' }}>
                <small>
                  <strong>{fieldLabel}</strong>
                </small>
              </EuiText>
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
  
  renderLegendDetails(sourceDescriptor) {
    return <DatashaderLegend styleDescriptor={this._descriptor} sourceDescriptor={sourceDescriptor} style={this} />;
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
