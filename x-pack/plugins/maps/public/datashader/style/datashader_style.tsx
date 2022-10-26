/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { EuiIcon, EuiSpacer, EuiText, EuiFlexItem, EuiFlexGroup, EuiToolTip } from '@elastic/eui';

import { DatashaderStyleEditor } from './components/datashader_style_editor';
import { DatashaderLegend } from './components/legend/datashader_legend';
import { getDefaultProperties } from './datashader_style_defaults';
import { IStyle } from '../style';
import { VectorIcon } from '../vector/components/legend/vector_icon';
import { DatashaderLayer } from '../../layers/datashader_layer/datashader_layer';
import { DatashaderSource } from '../../sources/datashader_source/datashader_source';
import { DataRequest } from '../../util/data_request';
import { getDatashader } from '../../../kibana_services';
import { LAYER_STYLE_TYPE, DATASHADER_STYLES } from '../../../../common/constants';
import {
  DatashaderStyleDescriptor,
  DatashaderStylePropertiesDescriptor,
  StyleDescriptor,
} from '../../../../common/descriptor_types/style_property_descriptor_types';
import { Query } from '../../../../../../../src/plugins/data/public';

export class DatashaderStyle implements IStyle {
  static type = LAYER_STYLE_TYPE.DATASHADER;
  _descriptor: DatashaderStyleDescriptor;
  _layer: DatashaderLayer;

  constructor(descriptor = {} as DatashaderStyleDescriptor, layer: DatashaderLayer) {
    this._descriptor = DatashaderStyle.createDescriptor(descriptor.properties);
    this._layer = layer;
  }

  static createDescriptor(properties = {} as DatashaderStylePropertiesDescriptor, isTimeAware = true): DatashaderStyleDescriptor {
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

  getDatashaderLayerSettings() {
    return getDatashader();
  }

  getType() {
    return LAYER_STYLE_TYPE.DATASHADER;
  }

  renderEditor(onStyleDescriptorChange: (styleDescriptor: StyleDescriptor) => void) {
    const rawProperties = this.getRawProperties();
    
    const handlePropertyChange = (settings: Partial<DatashaderStylePropertiesDescriptor>) => {
      const datashaderStyleDescriptor = DatashaderStyle.createDescriptor({ ...rawProperties, ...settings });
      onStyleDescriptorChange(datashaderStyleDescriptor);
    };
    
    const config = this.getDatashaderLayerSettings();

    if (!this._descriptor.properties.ellipseMajorField && config && config.defaultEllipseMajor) {
      handlePropertyChange({ [DATASHADER_STYLES.ELLIPSE_MAJOR_FIELD]: config.defaultEllipseMajor});
    }
    if (!this._descriptor.properties.ellipseMinorField && config && config.defaultEllipseMinor) {
      handlePropertyChange({ [DATASHADER_STYLES.ELLIPSE_MINOR_FIELD]: config.defaultEllipseMinor });
    }
    if (!this._descriptor.properties.ellipseTiltField && config && config.defaultEllipseTilt) {
      handlePropertyChange({ [DATASHADER_STYLES.ELLIPSE_TILT_FIELD]: config.defaultEllipseTilt });
    }

    return (
      <DatashaderStyleEditor
        properties={this._descriptor.properties}
        handlePropertyChange={handlePropertyChange}
        layer={this._layer}
      />
    );
  }

  _renderStopIcon(color: string | undefined, isLinesOnly: boolean, isPointsOnly: boolean, symbolId: string | undefined) {
    const fillColor = color || 'none';
    return (
      <VectorIcon
        fillColor={fillColor}
        isPointsOnly={isPointsOnly}
        isLinesOnly={isLinesOnly}
        strokeColor={fillColor}
        symbolId={symbolId}
      />
    );
  }

  _renderColorbreaks(
    { isLinesOnly, isPointsOnly, symbolId, legend }:
    { isLinesOnly: boolean, isPointsOnly: boolean, symbolId: string | undefined, legend: any }) {
    if (!legend || legend.length === 0) {
      return <EuiText size={'xs'}></EuiText>
    }

    let colorAndLabels = []
    for (let category of legend) {
        colorAndLabels.push({
            label: category.key,
            color: category.color,
            count: category.count,
        });
    }

    return colorAndLabels.map((config, index) => {
      let label = (<div></div>);
      if (config.label && config.label.trim() !== "") {
        label = config.label;
      } else {
        label = (<em>empty</em>);
      }

      let count = "";
      if (config.count) {
        count = "(" + config.count + ")";
      }

      return (
        <EuiFlexItem key={index}>
          <EuiFlexGroup direction={'row'} gutterSize={'none'}>
            <EuiFlexItem>
              <EuiText size={'xs'}>{label} {count}</EuiText>
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

  renderBreakedLegend(
    { fieldLabel, isPointsOnly, isLinesOnly, symbolId, legend }:
    { fieldLabel: string, isPointsOnly: boolean, isLinesOnly: boolean, symbolId: string | undefined, legend: any }) {
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
  
  renderLegendDetails(source: DatashaderSource, sourceDataRequest: DataRequest | undefined, query: Query | undefined) {
    return (
      <DatashaderLegend
        sourceDescriptorUrlTemplate={source.getUrlTemplate()}
        sourceDescriptorIndexTitle={source.getIndexTitle()}
        styleDescriptorCategoryField={this._descriptor.properties.categoryField}
        style={this}
        sourceDataRequest={sourceDataRequest}
        query={query}
      />
    );
  }

  getIcon() {
    return <EuiIcon size="m" type="datashader" />;
  }

  getStyleUrlParams(data: any) {
    let urlParams = "";

    // the current implementation of auto is too slow, so remove it
    let span = this._descriptor.properties.spanRange;
    //if (span === "auto") {
    //  span = "normal";
    //}

    urlParams = urlParams.concat(
        "&span=", span,
    )

    if (this._descriptor.properties.showEllipses &&
        this._descriptor.properties.ellipseMajorField &&
        this._descriptor.properties.ellipseMinorField &&
        this._descriptor.properties.ellipseTiltField) {
      urlParams = urlParams.concat(
        "&ellipses=", this._descriptor.properties.showEllipses.toString(),
        "&ellipse_major=", this._descriptor.properties.ellipseMajorField,
        "&ellipse_minor=", this._descriptor.properties.ellipseMinorField,
        "&ellipse_tilt=", this._descriptor.properties.ellipseTiltField,
        "&ellipse_units=", this._descriptor.properties.ellipseUnits,
        "&ellipse_search=", this._descriptor.properties.ellipseSearchDistance,
        "&spread=", this._descriptor.properties.ellipseThickness.toString(),
      );
    } else {
      urlParams = urlParams.concat(
        "&spread=", this._descriptor.properties.spread,
        "&resolution=", this._descriptor.properties.gridResolution
      )
    }

    if (this._descriptor.properties.mode === "heat") {
      urlParams = urlParams.concat(
        "&cmap=", this._descriptor.properties.colorRampName,
      );
    } else if (this._descriptor.properties.mode === "category" &&
              this._descriptor.properties.categoryField &&
              this._descriptor.properties.categoryFieldType &&
              this._descriptor.properties.colorKeyName
    ) {
      urlParams = urlParams.concat(
        "&category_field=", this._descriptor.properties.categoryField,
        "&category_type=", this._descriptor.properties.categoryFieldType,
        "&cmap=", this._descriptor.properties.colorKeyName,
      );
      if (this._descriptor.properties.useHistogram === true) {
        urlParams = urlParams.concat(
          "&category_histogram=true" 
        );
      } else if (this._descriptor.properties.useHistogram === false) {
        urlParams = urlParams.concat(
          "&category_histogram=false" 
        );        
      }

      if (data) {
        let pattern = (data.categoryFieldMeta && data.categoryFieldMeta.spec.format) ? data.categoryFieldMeta.spec.format.params.pattern : null;
        if (!pattern && data.categoryFieldFormatter) {
          pattern = data.categoryFieldFormatter.getParamDefaults().pattern
        }
        urlParams = urlParams.concat(
          "&category_pattern=", pattern
        );
      } else if (this._descriptor.properties.categoryFieldPattern) {
        urlParams = urlParams.concat(
          "&category_pattern=", this._descriptor.properties.categoryFieldPattern
        );
      }
    }

    return urlParams;
  }
}
