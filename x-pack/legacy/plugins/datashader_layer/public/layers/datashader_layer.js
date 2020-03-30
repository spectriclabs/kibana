/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AbstractLayer } from '../../../maps/public/layers/layer';
import _ from 'lodash';
import { SOURCE_DATA_ID_ORIGIN, LAYER_TYPE } from '../../../maps/common/constants';
import { DatashaderStyle } from './styles/datashader/datashader_style';

export class DatashaderLayer extends AbstractLayer {
  static type = LAYER_TYPE.DATASHADER;
  appliedUrl = '';

  constructor({ layerDescriptor, source, style }) {
    super({ layerDescriptor, source, style });
    if (!layerDescriptor.style) {
      const defaultStyle = DatashaderStyle.createDescriptor();
      this._style = new DatashaderStyle(defaultStyle);
    } else {
      this._style = new DatashaderStyle(layerDescriptor.style);
    }
  }

  static createDescriptor(options) {
    const tileLayerDescriptor = super.createDescriptor(options);
    tileLayerDescriptor.type = DatashaderLayer.type;
    tileLayerDescriptor.alpha = _.get(options, 'alpha', 1);
    return tileLayerDescriptor;
  }

  async getCategoricalFields() {
    return await this._source.getCategoricalFields();
  }

  async getNumberFields() {
    return await this._source.getNumberFields();
  }

  async syncData({ startLoading, stopLoading, onLoadError, dataFilters }) {
    if (!this.isVisible() || !this.showAtZoomLevel(dataFilters.zoom)) {
      return;
    }

    // TODO consider returning if there is no need to recalculate
    // the tile URL

    const requestToken = Symbol(`layer-source-refresh:${this.getId()} - source`);
    startLoading(SOURCE_DATA_ID_ORIGIN, requestToken, dataFilters);
    try {
      const url = await this._source.getUrlTemplate();
      const indexTitle = await this._source.getIndexTitle();
      const timeFieldName = await this._source.getTimeFieldName();
      const geoField = await this._source.getGeoField();
      const data = {
        url: url,
        indexTitle: indexTitle,
        timeFieldName: timeFieldName,
        geoField: geoField
      }

      stopLoading(SOURCE_DATA_ID_ORIGIN, requestToken, data, {});
    } catch (error) {
      onLoadError(SOURCE_DATA_ID_ORIGIN, requestToken, error.message);
    }
  }

  _getMbLayerId() {
    return this.makeMbLayerId('raster');
  }

  getMbLayerIds() {
    return [this._getMbLayerId()];
  }

  ownsMbLayerId(mbLayerId) {
    return this._getMbLayerId() === mbLayerId;
  }

  ownsMbSourceId(mbSourceId) {
    return this.getId() === mbSourceId;
  }

  syncLayerWithMB(mbMap) {
    const source = mbMap.getSource(this.getId());
    const mbLayerId = this._getMbLayerId();
    const sourceId = this.getId();

    const sourceDataRequest = this.getSourceDataRequest();
    if (!sourceDataRequest) {
      //this is possible if the layer was invisible at startup.
      //the actions will not perform any data=syncing as an optimization when a layer is invisible
      //when turning the layer back into visible, it's possible the url has not been resovled yet.
      return;
    }

    let data = sourceDataRequest.getData()

    if (!data.indexTitle) {
      return;
    }

    if (!data.geoField) {
      return;
    }

    if (!data.url) {
      return;
    }

    let currentParams = "";
    let dataMeta = sourceDataRequest.getMeta();
    if (dataMeta) {
      const currentParamsObj = {};
      currentParamsObj.timeFilters = dataMeta.timeFilters;
      currentParamsObj.filters = dataMeta.filters;
      currentParamsObj.query = dataMeta.query;

      currentParams = currentParams.concat(
        "params=", JSON.stringify(currentParamsObj),
        "&timestamp_field=", data.timeFieldName,
        "&geopoint_field=", data.geoField,
        this._style.getStyleUrlParams(),
      );
    }

    let url = data.url.concat(
      "/tms/",
      data.indexTitle,
      "/{z}/{x}/{y}.png?",
      currentParams
    );
    
    if ((!source) || (source.tiles[0] != url)) {
      
      if (mbMap.getLayer(mbLayerId)) {
        mbMap.removeLayer(mbLayerId);  
      }
      if (mbMap.getSource(sourceId)) {
        mbMap.removeSource(sourceId)
      }

      mbMap.addSource(sourceId, {
        type: 'raster',
        tiles: [url],
        tileSize: 256,
        scheme: 'xyz',
      });

      mbMap.addLayer({
        id: mbLayerId,
        type: 'raster',
        source: sourceId,
        minzoom: this._descriptor.minZoom,
        maxzoom: this._descriptor.maxZoom,
      });

      mbMap._render();
    }

    this._setTileLayerProperties(mbMap, mbLayerId);
  }

  _setTileLayerProperties(mbMap, mbLayerId) {
    if (mbMap.getLayer(mbLayerId)) {
      this.syncVisibilityWithMb(mbMap, mbLayerId);
    }
    if (mbMap.getLayer(mbLayerId)) {
      mbMap.setLayerZoomRange(mbLayerId, this._descriptor.minZoom, this._descriptor.maxZoom);
    }
    if (mbMap.getLayer(mbLayerId)) {
      mbMap.setPaintProperty(mbLayerId, 'raster-opacity', this.getAlpha());
    }
  }

  getLayerTypeIconName() {
    return 'grid';
  }

  isLayerLoading() {
    return false;
  }

  async hasLegendDetails() {
    return true;
  }

  renderLegendDetails() {
    return this._style.renderLegendDetails(this._source);
  }
}
