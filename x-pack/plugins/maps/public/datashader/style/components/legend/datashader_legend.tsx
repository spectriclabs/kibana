/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import fetch from 'node-fetch';
import _ from 'lodash';
import { Query } from '../../../../../../../../src/plugins/data/public';
import { esKuery, esQuery } from '../../../../../../../../src/plugins/data/public';
import { DatashaderStyle } from '../../datashader_style';
import { DataRequest } from '../../../../classes/util/data_request';

interface Props {
  query?: Query;
  sourceDataRequest?: DataRequest;
  sourceDescriptorUrlTemplate: string;
  sourceDescriptorIndexTitle: string;
  styleDescriptorCategoryField: string;
  style: DatashaderStyle;
}

interface State {
  legend: any;
  url: string;
}

export class DatashaderLegend extends React.Component<Props, State> {
  private _isMounted: boolean = false;

  state: State = {
    legend: undefined,
    url: '',
  }

  async _fetch(url: string) {
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
    let url = this.props.sourceDescriptorUrlTemplate;

    // only category maps have a legend, but in the future
    // TODO have a heat map legend that shows the colormap 
    if (!this.props.styleDescriptorCategoryField) {
      if (this._isMounted && this.state.legend !== null) {
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

    let data = this.props.sourceDataRequest?.getData();
   
    if (!data) {
      return;
    }

    const geoField: string = _.get(data, 'geoField', '');
    const timeFieldName: string = _.get(data, 'timeFieldName', '');
    const applyGlobalQuery: boolean = _.get(data, 'applyGlobalQuery', false);

    if (geoField.length === 0) {
      return;
    }

    if (timeFieldName.length === 0) {
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

    const currentParamsObj: any = {};

    if (data.applyGlobalTime) {
      currentParamsObj.timeFilters = dataMeta.timeFilters;
    }

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
      "params=", encodeURIComponent(JSON.stringify(currentParamsObj)),
      "&timestamp_field=", timeFieldName,
      "&geopoint_field=", geoField,
      this.props.style.getStyleUrlParams(data),
    );

    url = url.concat(
      "/",
      this.props.sourceDescriptorIndexTitle,
      "/",
      this.props.styleDescriptorCategoryField,
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
        throw new Error(`Unable to access ${this.state.url}`);
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
      fieldLabel: this.props.styleDescriptorCategoryField,
      isLinesOnly: false,
      isPointsOnly: true,
      symbolId: undefined,
      legend: this.state.legend
    });
  }


}
