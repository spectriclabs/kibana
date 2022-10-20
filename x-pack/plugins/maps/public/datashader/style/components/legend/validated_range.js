/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { EuiFlexGroup, EuiFlexItem, EuiDualRange, EuiText, EuiToolTip } from '@elastic/eui';

function isWithinRange(min, max, value) {
  if (value >= min && value <= max) {
    return true;
  }

  return false;
}

// TODO move to EUI
// Wrapper around EuiRange that ensures onChange callback is only called when value is number and within min/max
export class ValidatedRange extends React.Component {
  state = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.value !== prevState.prevValue) {
      return {
        value: nextProps.value,
        prevValue: nextProps.value,
        isValid: isWithinRange(nextProps.min, nextProps.max, nextProps.value),
      };
    }

    return null;
  }

  _onRangeChange = (e) => {
    this.setState({
      value: e
    });


    this.props.onChange(e);

  };

  render() {
    const {
      max,
      min,
      value, // eslint-disable-line no-unused-vars
      onChange, // eslint-disable-line no-unused-vars
      label,
      ...rest
    } = this.props;

    const rangeInput = (
      <EuiDualRange
        min={min}
        max={max}
        value={this.state.value}
        onChange={this._onRangeChange}
        {...rest}
      />
    );

    if (!this.state.isValid) {
      // Wrap in div so single child is returned.
      // common pattern is to put ValidateRange as a child to EuiFormRow and EuiFormRow expects a single child
      return (
        <div>
            <EuiFlexGroup gutterSize="xs" justifyContent="spaceAround">
            <EuiFlexItem grow={false}>
                <EuiToolTip position="top" title={label} content={label}>
                <EuiText className="eui-textTruncate" size="xs" style={{ maxWidth: '180px' }}>
                    <small>
                    <strong>{label}</strong>
                    </small>
                </EuiText>
                </EuiToolTip>
            </EuiFlexItem>
            </EuiFlexGroup>
          {rangeInput}
        </div>
      );
    }

    return rangeInput;
  }
}
