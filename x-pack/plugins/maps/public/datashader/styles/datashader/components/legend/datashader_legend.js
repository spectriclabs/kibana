/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';

import { i18n } from '@kbn/i18n';
import { EuiText } from '@elastic/eui';
import fetch from 'node-fetch';
import { esKuery, esQuery } from '../../../../../../../../../src/plugins/data/public';

import {
  DEFAULT_RGB_DATASHADER_COLOR_RAMP,
  DEFAULT_DATASHADER_COLOR_RAMP_NAME,
  DATASHADER_COLOR_RAMP_LABEL,
} from '../datashader_constants';

export class DatashaderLegend extends React.Component {
  constructor() {
    super();
    this.state = { url: '', legend: null };
  }

  async _fetch(url) {
    return fetch(url);
  }

  componentDidUpdate() {
    this._loadLegendInfo();
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadLegendInfo();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  async _loadLegendInfo() {
    let url = await this.props.sourceDescriptor.getUrlTemplate();

    // only category maps have a legend, but in the future
    // TODO have a heat map legend that shows the colormap 
    if (!this.props.styleDescriptor.properties.categoryField) {
      if (this.state.legend !== null) {
        this.setState({ legend: null });
      }
      return;
    }

    // we need to have a sourceDataRequest
    if (!this.props.sourceDataRequest) {
      if (this.state.legend !== null) {
        this.setState({ legend: null });
      }
      return;
    }

    let data = this.props.sourceDataRequest.getData()
   
    if (!data) {
      return;
    }

    if (!data.geoField) {
      return;
    }

    if (!data.timeFieldName) {
      return;
    }
    
    let dataMeta = this.props.sourceDataRequest.getMeta();
    // if we don't have dataMeta we cannot request a legend
    if (!dataMeta) {
      if (this.state.legend !== null) {
          this.setState({ legend: null});
      }
      return;
    }

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
    currentParamsObj.extent = dataMeta.extent;
    currentParamsObj.zoom = dataMeta.zoom;
    if (this.props.query && this.props.query.language === "kuery") {
      const kueryNode = esKuery.fromKueryExpression(this.props.query.query);
      const kueryDSL = esKuery.toElasticsearchQuery(kueryNode);
      currentParamsObj.filters.push( {
        "meta": {
          "type" : "bool",
        },
        "query": kueryDSL
       } ); 
      } else if (this.props.query && this.props.query.language === "lucene") {
      const luceneDSL = esQuery.luceneStringToDsl(this.props.query.query);
      currentParamsObj.filters.push( {
        "meta": {
          "type" : "bool",
        },
        "query": luceneDSL
       } );
    }
    let currentParams = "";
    currentParams = currentParams.concat(
      "params=", JSON.stringify(currentParamsObj),
      "&timestamp_field=", data.timeFieldName,
      "&geopoint_field=", data.geoField,
      this.props.style.getStyleUrlParams(data),
    );

    url = url.concat(
      "/",
      this.props.sourceDescriptor.getIndexTitle(),
      "/",
      this.props.styleDescriptor.properties.categoryField,
      "/legend.json?",
      currentParams
    );

    if (this.state.url !== url) {
      //Fetch the legend content
      const resp = await this._fetch(url);
      if (resp.status >= 400) {
        if (this.state.legend !== null) {
          this.setState({ legend: null });
        }
        throw new Error(`Unable to access ${this.state.serviceUrl}`);
      }
      const body = await resp.text();
      const legend = JSON.parse(body)
      this.setState({legend: legend, url: url});
    }
  }

  render() {
    if (this.state.legend === null) {
      return null;
    }

    return this.props.style.renderBreakedLegend({
      fieldLabel: this.props.styleDescriptor.properties.categoryField,
      isLinesOnly: false,
      isPointsOnly: true,
      symbolId: null,
      legend: this.state.legend
    });
  }


}