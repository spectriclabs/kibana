/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Nouislider from 'nouislider-react'; // eslint-disable-line import/no-extraneous-dependencies
import 'nouislider/distribute/nouislider.css'; // eslint-disable-line import/no-extraneous-dependencies
import './nouislider.css';

import { styleOptionShapes, rangeShape } from '../style_option_shapes';
import { VectorStyle } from '../../../vector_style';
import { ColorGradient } from '../../color_gradient';
import { CircleIcon } from './circle_icon';
import { getVectorStyleLabel } from '../get_vector_style_label';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule } from '@elastic/eui';
import { StyleLegendRow } from '../../style_legend_row';

function getLineWidthIcons() {
  const defaultStyle = {
    stroke: 'grey',
    fill: 'none',
    width: '12px',
  };
  return [
    <CircleIcon style={{ ...defaultStyle, strokeWidth: '1px' }}/>,
    <CircleIcon style={{ ...defaultStyle, strokeWidth: '2px' }}/>,
    <CircleIcon style={{ ...defaultStyle, strokeWidth: '3px' }}/>,
  ];
}

function getSymbolSizeIcons() {
  const defaultStyle = {
    stroke: 'grey',
    strokeWidth: 'none',
    fill: 'grey',
  };
  return [
    <CircleIcon style={{ ...defaultStyle, width: '4px' }}/>,
    <CircleIcon style={{ ...defaultStyle, width: '8px' }}/>,
    <CircleIcon style={{ ...defaultStyle, width: '12px' }}/>,
  ];
}

function renderHeaderWithIcons(icons) {
  return (
    <EuiFlexGroup gutterSize="s" justifyContent="spaceBetween" alignItems="center">
      {
        icons.map((icon, index) => {
          const isLast = index === icons.length - 1;
          let spacer;
          if (!isLast) {
            spacer = (
              <EuiFlexItem>
                <EuiHorizontalRule margin="xs" />
              </EuiFlexItem>
            );
          }
          return (
            <Fragment key={index}>
              <EuiFlexItem grow={false}>
                {icon}
              </EuiFlexItem>
              {spacer}
            </Fragment>
          );
        })
      }
    </EuiFlexGroup>
  );
}

function renderSlider(ref, range, field, layerId) {
  const onUpdate = (values, handle) => {
    const label = ref._formatValue(parseInt(values[handle]));
    if (handle === 0) {
      ref.setState({ minLabel: label });
    }
    else {
      ref.setState({ maxLabel: label });
    }

    // update the map
    const map = ref.props.getMap();
    if (map) {
      const filter = ['all', ['>=', field, values[0]], ['<=', field, values[1]]];
      map.setFilter(layerId + '_circle', filter);
    }
  };

  if (!range) {
    range = { min: 0, max: 1 };
  }

  return (
    <Nouislider
      range={{ min: range.min, max: range.max }}
      behaviour="drag"
      start={[range.min, range.max]}
      onUpdate={onUpdate}
      instanceRef={instance => {
        if (instance) {
          ref.setState({ sliderRef: instance });
        }
      }}
      layerId={layerId}
      connect
      isTime
    />
  );
}

const EMPTY_VALUE = '';

export class StylePropertyLegendRow extends Component {

  state = {
    label: '',
    hasLoadedFieldFormatter: false,
    sliderRef: null,
    minLabel: '',
    maxLabel: '',
  }

  componentDidMount() {
    this._isMounted = true;
    this._prevLabel = undefined;
    this._fieldValueFormatter = undefined;
    this._loadLabel();
    this._loadFieldFormatter();
  }

  componentDidUpdate() {
    // label could change so it needs to be loaded on update
    this._loadLabel();
    this._loadMin();
    this._loadMax();
  }

  componentWillUnmount() {
    this._isMounted = false;

    if (this.state.sliderRef) {
      // remove the time filter when time slider is hidden
      const map = this.props.getMap();
      if (map) {
        const layerId = this.props.layerId;
        map.setFilter(layerId + '_circle');
      }
    }
  }

  async _loadFieldFormatter() {
    this._fieldValueFormatter = await this.props.getFieldFormatter(this.props.options.field);
    if (this._isMounted) {
      this.setState({ hasLoadedFieldFormatter: true });
    }
  }

  _loadLabel = async () => {
    if (this._isStatic()) {
      return;
    }

    // have to load label and then check for changes since field name stays constant while label may change
    const label = await this.props.getFieldLabel(this.props.options.field.name);
    if (this._prevLabel === label) {
      return;
    }

    this._prevLabel = label;
    if (this._isMounted) {
      this.setState({ label });
    }
  }

  _loadMin = async () => {
    if (this._isStatic()) {
      return;
    }

    const minLabel = this._formatValue(_.get(this.props.range, 'min', EMPTY_VALUE));
    if (this._prevMin === minLabel) {
      return;
    }

    this._prevMin = minLabel;
    if (this._isMounted) {
      this.setState({ minLabel });
    }
  }

  _loadMax = async () => {
    if (this._isStatic()) {
      return;
    }

    const maxLabel = this._formatValue(_.get(this.props.range, 'max', EMPTY_VALUE));
    if (this._prevMax === maxLabel) {
      return;
    }

    this._prevMax = maxLabel;
    if (this._isMounted) {
      this.setState({ maxLabel });
    }
  }

  _isStatic() {
    return this.props.type === VectorStyle.STYLE_TYPE.STATIC ||
        !this.props.options.field || !this.props.options.field.name;
  }

  _formatValue = value => {
    if (!this.state.hasLoadedFieldFormatter || !this._fieldValueFormatter || value === EMPTY_VALUE) {
      return value;
    }

    return this._fieldValueFormatter(value);
  }

  play = (isPlaying) => {
    if (isPlaying) {
      const doPlay = this.doPlay;
      const slider = this.state.sliderRef.noUiSlider;
      this.interval = setInterval(function () {doPlay(slider);}, 80);
    }
    else {
      clearInterval(this.interval);
    }
  }

  doPlay = (slider) => {
    const range = slider.options.range;
    const timeDelta = (range.max - range.min) / 100;
    const values = slider.get();
    let first = parseInt(values[0]);
    let second = parseInt(values[1]);
    first += timeDelta;
    second += timeDelta;
    if (second > range.max) {
      const playTimeDelta = second - first;
      first = range.min;
      second = range.min + playTimeDelta;
    }
    const newValues = [first, second];
    slider.set(newValues);
  }

  render() {
    const { name, options, range } = this.props;
    if (this._isStatic()) {
      return null;
    }

    let header;
    if (options.color) {
      header = <ColorGradient colorRampName={options.color}/>;
    } else if (name === 'lineWidth') {
      header = renderHeaderWithIcons(getLineWidthIcons());
    } else if (name === 'iconSize') {
      header = renderHeaderWithIcons(getSymbolSizeIcons());
    } else if (name === 'time') {
      const field = options.field.name;
      const layerId = this.props.layerId;
      header = renderSlider(this, range, field, layerId);
    }

    return (
      <StyleLegendRow
        header={header}
        minLabel={this.state.minLabel}
        maxLabel={this.state.maxLabel}
        propertyLabel={getVectorStyleLabel(name)}
        fieldLabel={this.state.label}
        play={this.play}
      />
    );
  }
}

StylePropertyLegendRow.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  options: PropTypes.oneOfType(styleOptionShapes).isRequired,
  range: rangeShape,
  getFieldLabel: PropTypes.func.isRequired,
  getFieldFormatter: PropTypes.func.isRequired,
  getMap: PropTypes.func.isRequired,
  layerId: PropTypes.string.isRequired,
};
