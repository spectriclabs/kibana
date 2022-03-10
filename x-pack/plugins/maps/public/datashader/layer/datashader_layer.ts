/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import type { Map as MbMap } from '@kbn/mapbox-gl';
import _ from 'lodash';

import { AbstractLayer } from '../layer';
import { DatashaderSource } from '../../sources/datashader_source/datashader_source';
import { DatashaderStyle } from '../../styles/datashader/datashader_style';
import { DataRequestContext } from '../../../actions';
import {
  SOURCE_DATA_REQUEST_ID,
  LAYER_TYPE,
  MIN_ZOOM,
  MAX_ZOOM,
} from '../../../../common/constants';
import { LayerDescriptor, DatashaderLayerDescriptor } from '../../../../common/descriptor_types';
import { esKuery, esQuery } from '../../../../../../../src/plugins/data/public';

export class DatashaderLayer extends AbstractLayer {
  static type = LAYER_TYPE.DATASHADER;
  appliedUrl = '';
  _source: DatashaderSource;
  _style: DatashaderStyle;
  _mbMap: MbMap | null;

  constructor({
    layerDescriptor,
    source,
  }: {
    layerDescriptor: DatashaderLayerDescriptor;
    source: DatashaderSource;
  }) {
    super({ layerDescriptor, source });
    
    if (!layerDescriptor.style) {
      const defaultStyle = DatashaderStyle.createDescriptor();
      this._style = new DatashaderStyle(defaultStyle, this);
    } else {
      this._style = new DatashaderStyle(layerDescriptor.style, this);
    }
    
    this._mbMap = null;
    this._source = source;
  }

  getSource(): DatashaderSource {
    return this._source;
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

  static createDescriptor(options: Partial<LayerDescriptor>): DatashaderLayerDescriptor {
    const tileLayerDescriptor = super.createDescriptor(options);
    tileLayerDescriptor.type = DatashaderLayer.type;
    tileLayerDescriptor.alpha = _.get(options, 'alpha', 1);
    tileLayerDescriptor.query = undefined;
    return tileLayerDescriptor as DatashaderLayerDescriptor;
  }

  async getCategoricalFields() {
    return await this._source.getCategoricalFields();
  }

  async getNumberFields() {
    return await this._source.getNumberFields();
  }

  //async syncData({ startLoading, stopLoading, onLoadError, dataFilters }) {
  async syncData(syncContext: DataRequestContext): Promise<void> {
    if (!this.isVisible() || !this.showAtZoomLevel(syncContext.dataFilters.zoom)) {
      return;
    }

    // TODO consider returning if there is no need to recalculate
    // the tile URL

    const requestToken = Symbol(`layer-source-refresh:${this.getId()} - source`);
    syncContext.startLoading(SOURCE_DATA_REQUEST_ID, requestToken, syncContext.dataFilters);
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
          return;
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

      syncContext.stopLoading(SOURCE_DATA_REQUEST_ID, requestToken, data, {});
    
    } catch (error) {
      syncContext.onLoadError(SOURCE_DATA_REQUEST_ID, requestToken, error.message);
    }
  }

  _getMbLayerId() {
    return this.makeMbLayerId('raster');
  }

  getMbLayerIds() {
    return [this._getMbLayerId()];
  }

  ownsMbLayerId(mbLayerId: string) {
    return this._getMbLayerId() === mbLayerId;
  }

  ownsMbSourceId(mbSourceId: string) {
    return this.getId() === mbSourceId;
  }

  syncLayerWithMB(mbMap: MbMap) {
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

    // Typescript thinks `data` might still be undefined here
    // so we have to get the properties we want like this.
    const indexTitle: string = _.get(data, 'indexTitle', '');
    const geoField: string = _.get(data, 'geoField', '');
    const timeFieldName: string = _.get(data, 'timeFieldName', '');
    const dataUrl: string = _.get(data, 'url', '');
    const applyGlobalQuery: string = _.get(data, 'applyGlobalQuery', true);

    if (indexTitle.length === 0) {
      return;
    }

    if (geoField.length === 0) {
      return;
    }

    if (timeFieldName.length === 0) {
      return;
    }

    if (dataUrl.length === 0) {
      return;
    }

    let currentParams = "";
    const dataMeta = sourceDataRequest.getMeta();
    
    if (dataMeta) {
      const currentParamsObj: any = {};
      currentParamsObj.timeFilters = dataMeta.timeFilters;
      currentParamsObj.filters = []

      if (applyGlobalQuery) {
        const dataMetaFilters = dataMeta.filters || [];
        currentParamsObj.filters = [...dataMetaFilters];
        
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
        "params=", encodeURIComponent(JSON.stringify(currentParamsObj)),
        "&timestamp_field=", timeFieldName,
        "&geopoint_field=", geoField,
        this._style.getStyleUrlParams(data),
      );
    }

    const url = dataUrl.concat(
      "/tms/",
      indexTitle,
      "/{z}/{x}/{y}.png?",
      currentParams
    );

    const sourceTiles = _.get(source, 'tiles', []);
    const sourceTilesUrl = sourceTiles.length === 0 ? '' : sourceTiles[0];
    
    if (!source || sourceTilesUrl != url) {
      
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
    }

    this._setTileLayerProperties(mbMap, mbLayerId);
  }

  _setTileLayerProperties(mbMap: MbMap, mbLayerId: string) {
    if (mbMap.getLayer(mbLayerId)) {
      this.syncVisibilityWithMb(mbMap, mbLayerId);
    }
    if (mbMap.getLayer(mbLayerId)) {
      mbMap.setLayerZoomRange(mbLayerId, this._descriptor.minZoom || MIN_ZOOM, this._descriptor.maxZoom || MAX_ZOOM);
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

  getIndexPatternIds(): string[] {
    const indexPatternIds = this._source.getIndexPatternIds();
    return indexPatternIds;
  }

  getQueryableIndexPatternIds() {
    const indexPatternIds = this._source.getQueryableIndexPatternIds();
    return indexPatternIds;
  }

}
