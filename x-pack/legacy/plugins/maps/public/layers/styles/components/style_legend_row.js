/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

export class StyleLegendRow extends Component {
  state = {
    isPlaying: false,
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  play = () => {
    const isPlaying = !this.state.isPlaying;
    if (this._isMounted) {
      this.setState({ isPlaying });
    }
    this.props.play(isPlaying);
  }

  render() {
    let playButton;
    if (this.props.header.props.isTime) {
      playButton = (
        <EuiButtonIcon
          iconType={!this.state.isPlaying ? 'play' : 'pause'}
          aria-label={!this.state.isPlaying ? i18n.translate('xpack.maps.styles.styleLegendRow.playButtonAriaLabel', {
            defaultMessage: 'Play'
          }) : i18n.translate('xpack.maps.styles.styleLegendRow.pauseButtonAriaLabel', {
            defaultMessage: 'Pause'
          })}
          title={!this.state.isPlaying ? i18n.translate('xpack.maps.styles.styleLegendRow.playButtonTitle', {
            defaultMessage: 'Play'
          }) : i18n.translate('xpack.maps.styles.styleLegendRow.pauseButtonTitle', {
            defaultMessage: 'Pause'
          })}
          onClick={this.play}
          style={{ height: '16px' }}
        />
      );
    }

    return (
      <div>
        <EuiSpacer size="xs"/>
        {this.props.header}
        <EuiFlexGroup gutterSize="xs" justifyContent="spaceBetween">
          <EuiFlexItem grow={true}>
            <EuiText size="xs">
              <small id="minLabel">{this.props.minLabel}</small>
            </EuiText>
          </EuiFlexItem>
          {playButton}
          <EuiFlexItem grow={false}>
            <EuiToolTip
              position="top"
              title={this.props.propertyLabel}
              content={this.props.fieldLabel}
            >
              <EuiText
                className="eui-textTruncate"
                size="xs"
                style={{ maxWidth: '180px' }}
              >
                <small><strong>{this.props.fieldLabel}</strong></small>
              </EuiText>
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={true}>
            <EuiText textAlign="right" size="xs">
              <small id="maxLabel">{this.props.maxLabel}</small>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}

StyleLegendRow.propTypes = {
  header: PropTypes.node.isRequired,
  minLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  maxLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  propertyLabel: PropTypes.string.isRequired,
  fieldLabel: PropTypes.string.isRequired,
  play: PropTypes.func,
};
