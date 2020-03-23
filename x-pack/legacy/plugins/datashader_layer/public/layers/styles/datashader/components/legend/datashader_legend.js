/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';

import { i18n } from '@kbn/i18n';
import { EuiText } from '@elastic/eui';
import fetch from 'node-fetch';

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

    //Fetch the legend content
    const resp = await this._fetch(url + "/" + this.props.sourceDescriptor.getIndexTitle() + "/" + this.props.styleDescriptor.properties.categoryField + "/legend.json")
    if (resp.status >= 400) {
      throw new Error(`Unable to access ${this.state.serviceUrl}`);
    }
    const body = await resp.text();
    const legend = JSON.parse(body)
    this.setState({legend: legend});
  }

  render() {
    if (this.state.legend === null) {
      return null;
    }

    return this.props.style.renderBreakedLegend({
      fieldLabel: this.state.category_field,
      isLinesOnly: false,
      isPointsOnly: true,
      symbolId: null,
      legend: this.state.legend
    });
  }


}
