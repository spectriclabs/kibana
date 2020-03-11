/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';

import { i18n } from '@kbn/i18n';
import { EuiText } from '@elastic/eui';

import {
  DEFAULT_RGB_DATASHADER_COLOR_RAMP,
  DEFAULT_DATASHADER_COLOR_RAMP_NAME,
  DATASHADER_COLOR_RAMP_LABEL,
} from '../datashader_constants';

export class DatashaderLegend extends React.Component {
  constructor() {
    super();
    this.state = { url: '' };
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

    // TOOD this is where you would make HTTP calls
    this.setState({url: url});
  }

  render() {
    return (
      <Fragment>
        <EuiText grow={false}>URL is {this.state.url}</EuiText>
        <EuiText grow={false}>Mode is {this.props.styleDescriptor.properties.mode}</EuiText>
      </Fragment>
    );
  }
}
