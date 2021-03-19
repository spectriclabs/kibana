/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AbstractLayer } from '../../public/classes/layers/layer';
import _ from 'lodash';
import { SOURCE_DATA_REQUEST_ID, LAYER_TYPE } from '../../common/constants';
import { DatashaderStyle } from './styles/datashader/datashader_style';
import { esKuery, esQuery } from '../../../../../src/plugins/data/public';

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
    this._mbMap = null;
  }

  
  getStyleForEditing() {
    return this._style;
  }

  getStyle() {
    return this._style;
  }

  getCurrentStyle() {
    return this._style;
  }

  static createDescriptor(options) {
    const tileLayerDescriptor = super.createDescriptor(options);
    tileLayerDescriptor.type = DatashaderLayer.type;
    tileLayerDescriptor.alpha = _.get(options, 'alpha', 1);
    tileLayerDescriptor.query = null;
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
    startLoading(SOURCE_DATA_REQUEST_ID, requestToken, dataFilters);
    try {
      const url = await this._source.getUrlTemplate();
      const indexTitle = await this._source.getIndexTitle();
      const timeFieldName = await this._source.getTimeFieldName();
      const geoField = await this._source.getGeoField();
      const applyGlobalQuery = this._source.getApplyGlobalQuery();

      const categoryField = this._style._descriptor.properties.categoryField;
      let categoryFormatter = null;
      let categoryFieldMeta = null;
      if (categoryField) {
        const indexPattern = await this._source.getIndexPattern();
        const fieldFromIndexPattern = indexPattern.fields.getByName(categoryField);
        if (!fieldFromIndexPattern) {
          return null;
        }

        categoryFormatter = indexPattern.getFormatterForField(fieldFromIndexPattern);
        categoryFieldMeta = indexPattern.getFieldByName(categoryField);
      }

      const data = {
        url: url,
        indexTitle: indexTitle,
        timeFieldName: timeFieldName,
        geoField: geoField,
        applyGlobalQuery: applyGlobalQuery,
        categoryFieldMeta: categoryFieldMeta,
        categoryFieldFormatter: categoryFormatter
      }

      stopLoading(SOURCE_DATA_REQUEST_ID, requestToken, data, {});
    } catch (error) {
      onLoadError(SOURCE_DATA_REQUEST_ID, requestToken, error.message);
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
    this._mbMap = mbMap;

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

    if (!data) {
      return;
    }

    if (!data.indexTitle) {
      return;
    }

    if (!data.geoField) {
      return;
    }

    if (!data.timeFieldName) {
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
      currentParamsObj.filters = []
      if (data.applyGlobalQuery) {
        currentParamsObj.filters = [...dataMeta.filters];
        if (dataMeta.query && dataMeta.query.language === "kuery") {
          const kueryNode = esKuery.fromKueryExpression(dataMeta.query.query);
          const kueryDSL = esKuery.toElasticsearchQuery(kueryNode);
          currentParamsObj.query = {
            language: "dsl",
            query: kueryDSL,
          };
        } else if (dataMeta.query && dataMeta.query.language === "lucene") {
          const luceneDSL = esQuery.luceneStringToDsl(dataMeta.query.query);
          currentParamsObj.query = {
            language: "dsl",
            query: luceneDSL,
          };
        } else {
          currentParamsObj.query = dataMeta.query;
        }
      }
      currentParamsObj.extent = dataMeta.extent; // .buffer has been expanded to align with tile boundaries
      currentParamsObj.zoom = dataMeta.zoom;
      if (this._descriptor.query && this._descriptor.query.language === "kuery") {
        const kueryNode = esKuery.fromKueryExpression(this._descriptor.query.query);
        const kueryDSL = esKuery.toElasticsearchQuery(kueryNode);
        currentParamsObj.filters.push( {
          "meta": {
            "type" : "bool",
          },
          "query": kueryDSL
         } );
      } else if (this._descriptor.query && this._descriptor.query.language === "lucene") {
        const luceneDSL = esQuery.luceneStringToDsl(this._descriptor.query.query);
        currentParamsObj.filters.push( {
          "meta": {
            "type" : "bool",
          },
          "query": luceneDSL
         } );
      }
      currentParams = currentParams.concat(
        "params=", JSON.stringify(currentParamsObj),
        "&timestamp_field=", data.timeFieldName,
        "&geopoint_field=", data.geoField,
        this._style.getStyleUrlParams(data),
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
    const sourceDataRequest = this.getSourceDataRequest();
    const query = this._descriptor.query;
    return this._style.renderLegendDetails(this._source, sourceDataRequest, query);
  }

  getIndexPatternIds() {
    const indexPatternIds = this._source.getIndexPatternIds();
    return indexPatternIds;
  }

  getQueryableIndexPatternIds() {
    const indexPatternIds = this._source.getQueryableIndexPatternIds();
    return indexPatternIds;
  }

}
