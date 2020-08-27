/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiFieldNumber,
  EuiFieldText,
  EuiButtonIcon,
  EuiPopover,
  EuiTextAlign,
  EuiSpacer,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { MAX_ZOOM, MIN_ZOOM } from '../../../../common/constants';
import { EuiButtonEmpty } from '@elastic/eui';
import { EuiRadioGroup } from '@elastic/eui';
import mgrs from 'mgrs';
import * as utm from 'utm';
import { ui } from '../../../reducers/ui';

function getViewString(lat, lon, zoom) {
  return `${lat},${lon},${zoom}`;
}

export const COORDINATE_SYSTEM_DEGREES_DECIMAL = "dd";
export const COORDINATE_SYSTEM_MGRS = "mgrs";
export const COORDINATE_SYSTEM_UTM = "utm";

export const DEFAULT_SET_VIEW_COORDINATE_SYSTEM = COORDINATE_SYSTEM_DEGREES_DECIMAL;


const COORDINATE_SYSTEMS = [
  {
    id: COORDINATE_SYSTEM_DEGREES_DECIMAL,
    label: 'Degrees Decimal'
  },
  {
    id: COORDINATE_SYSTEM_UTM,
    label: 'UTM'
  },
  {
    id: COORDINATE_SYSTEM_MGRS,
    label: 'MGRS'
  }
];

export class SetViewControl extends Component {
  state = {
    coord: DEFAULT_SET_VIEW_COORDINATE_SYSTEM
  };

  static convertLatLonToUTM(lat, lon) {
    const utmCoord = utm.fromLatLon(
      lat,
      lon
    );

    let eastwest = 'E';
    if (utmCoord.easting < 0) {
      eastwest = 'W';
    }
    let norwest = 'N';
    if (utmCoord.northing < 0) {
      norwest = 'S';
    }

    utmCoord.zone = `${utmCoord.zoneNum}${utmCoord.zoneLetter}`
    utmCoord.easting = Math.round(utmCoord.easting);
    utmCoord.northing = Math.round(utmCoord.northing);
    utmCoord.str = `${utmCoord.zoneNum}${utmCoord.zoneLetter} ${utmCoord.easting}${eastwest} ${utmCoord.northing}${norwest}`
    
    return utmCoord;
  }

  static convertLatLonToMGRS(lat, lon) {

    const mgrsCoord = mgrs.forward([
      lon,
      lat
    ]);

    return mgrsCoord;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextView = getViewString(nextProps.center.lat, nextProps.center.lon, nextProps.zoom);
    
    const utm = SetViewControl.convertLatLonToUTM(nextProps.center.lat, nextProps.center.lon);
    const mgrs = SetViewControl.convertLatLonToMGRS(nextProps.center.lat, nextProps.center.lon);

    if (nextView !== prevState.prevView) {
      return {
        lat: nextProps.center.lat,
        lon: nextProps.center.lon,
        zoom: nextProps.zoom,
        utm: utm,
        mgrs: mgrs,
        prevView: nextView,
      };
    }

    return null;
  }

  /**
   * Sync all coordinates to the lat/lon that is set
   */
  _syncToLatLon = () => {
    if (this.state.lat !== '' && this.state.lon !== '') {

      const utm = SetViewControl.convertLatLonToUTM(this.state.lat, this.state.lon);
      const mgrs = SetViewControl.convertLatLonToMGRS(this.state.lat, this.state.lon);

      this.setState({mgrs: mgrs, utm: utm});
    } else {
      this.setState({mgrs: '', utm: ''});
    }
  }

  /**
   * Sync the current lat/lon to MGRS that is set
   */
  _syncToMGRS = () => {
    if (this.state.mgrs !== '') {
      let lon, lat;

      try {
          [ lon, lat ] = mgrs.toPoint(this.state.mgrs);
      } catch(err) {
        console.log("error convering MGRS", err);
        return;
      }

      const utm = SetViewControl.convertLatLonToUTM(lat, lon);

      this.setState({
        lat: isNaN(lat) ? '' : lat,
        lon: isNaN(lon) ? '' : lon,
        utm: utm
      });

    } else {
      this.setState({
        lat: '',
        lon: '',
        utm: {}
      });
    }
  }

    /**
   * Sync the current lat/lon to MGRS that is set
   */
  _syncToUTM = () => {
    if (this.state.utm) {
      let latitude, longitude;
      try {
        ( { latitude, longitude } = utm.toLatLon(
          this.state.utm.easting,
          this.state.utm.northing,
          this.state.utm.zoneNum,
          this.state.utm.zoneLetter
        ));
      } catch(err) {
        console.log("error converting UTM");
        return;
      }

      const mgrs = SetViewControl.convertLatLonToMGRS(latitude, longitude);

      this.setState({
        lat: isNaN(latitude) ? '' : latitude,
        lon: isNaN(longitude) ? '' : longitude,
        mgrs: mgrs
      });

    } else {
      this.setState({
        lat: '',
        lon: '',
        mgrs: ''
      });
    }
  }

  _togglePopover = () => {
    if (this.props.isSetViewOpen) {
      this.props.closeSetView();
      return;
    }

    this.props.openSetView();
  };

  _onCoordinateSystemChange = coordId => {
    this.setState({
      coord: coordId,
    }); 
  };

  _onLatChange = evt => {
    this._onChange('lat', evt);
  };

  _onLonChange = evt => {
    this._onChange('lon', evt);
  };

  _onUTMZoneChange = evt => {
    let newUtm = this.state.utm;
    newUtm.zone = evt.target.value;
    newUtm.zoneNum = newUtm.zone.substring(0, newUtm.zone.length - 1);
    newUtm.zoneLetter = newUtm.zone.substring(newUtm.zone.length - 1, newUtm.zone.length);

    this.setState({
      utm: newUtm
    }, this._syncToUTM);
  };

  _onUTMEastingChange = evt => {
    const sanitizedValue = parseFloat(evt.target.value);

    let newUtm = this.state.utm;
    newUtm.easting = isNaN(sanitizedValue) ? '' : sanitizedValue;

    this.setState({
      utm: newUtm
    }, this._syncToUTM);
  };

  _onUTMNorthingChange = evt => {
    const sanitizedValue = parseFloat(evt.target.value);

    let newUtm = this.state.utm;
    newUtm.northing = isNaN(sanitizedValue) ? '' : sanitizedValue;

    this.setState({
      utm: newUtm
    }, this._syncToUTM);
  };

  _onMGRSChange = evt => {
    const mgrs = evt.target.value;
    this.setState({
      mgrs: mgrs
    }, this._syncToMGRS);
  };

  _onZoomChange = evt => {
    this._onChange('zoom', evt);
  };

  _onChange = (name, evt) => {
    const sanitizedValue = parseFloat(evt.target.value);
    this.setState({
      [name]: isNaN(sanitizedValue) ? '' : sanitizedValue,
    }, this._syncToLatLon);
  };

  _renderNumberFormRow = ({ value, min, max, onChange, label, dataTestSubj }) => {
    const isInvalid = value === '' || value > max || value < min;
    const error = isInvalid ? `Must be between ${min} and ${max}` : null;
    return {
      isInvalid,
      component: (
        <EuiFormRow label={label} isInvalid={isInvalid} error={error} display="columnCompressed">
          <EuiFieldNumber
            compressed
            value={value}
            onChange={onChange}
            isInvalid={isInvalid}
            data-test-subj={dataTestSubj}
          />
        </EuiFormRow>
      ),
    };
  };

  _renderMGRSFormRow = ({ value, onChange, label, dataTestSubj }) => {
    let point;
    try {
      point = mgrs.toPoint(value);
    } catch(err) {
      point = undefined;
      console.log("error convering MGRS", err);
    }

    const isInvalid = value === '' || point === undefined;
    const error = isInvalid ? `MGRS is invalid` : null;
    return {
      isInvalid,
      component: (
        <EuiFormRow label={label} isInvalid={isInvalid} error={error} display="columnCompressed">
          <EuiFieldText
            compressed
            value={value}
            onChange={onChange}
            isInvalid={isInvalid}
            data-test-subj={dataTestSubj}
          />
        </EuiFormRow>
      ),
    };
  };

  _renderUTMZoneRow = ({ value, onChange, label, dataTestSubj }) => {
    const zoneNum = ( value ) ? parseInt(value.substring(0, value.length - 1)) : '';
    const zoneLetter = ( value ) ? value.substring(value.length - 1, value.length) : '';

    let point;
    try {
      point = utm.toLatLon(
        this.state.utm.easting,
        this.state.utm.northing,
        zoneNum,
        zoneLetter
      );
    } catch {
      point = undefined;
    }

    const isInvalid = value === '' || point === undefined;
    const error = isInvalid ? `UTM Zone is invalid` : null;
    return {
      isInvalid,
      component: (
        <EuiFormRow label={label} isInvalid={isInvalid} error={error} display="columnCompressed">
          <EuiFieldText
            compressed
            value={value}
            onChange={onChange}
            isInvalid={isInvalid}
            data-test-subj={dataTestSubj}
          />
        </EuiFormRow>
      ),
    };
  };

  _renderUTMEastingRow = ({ value, onChange, label, dataTestSubj }) => {
    let point;
    try {
      point = utm.toLatLon(
        parseFloat(value),
        this.state.utm.northing,
        this.state.utm.zoneNum,
        this.state.utm.zoneLetter
      );
    } catch {
      point = undefined;
    }
    const isInvalid = value === '' || point === undefined;
    const error = isInvalid ? `UTM Easting is invalid` : null;
    return {
      isInvalid,
      component: (
        <EuiFormRow label={label} isInvalid={isInvalid} error={error} display="columnCompressed">
          <EuiFieldNumber
            compressed
            value={value}
            onChange={onChange}
            isInvalid={isInvalid}
            data-test-subj={dataTestSubj}
          />
        </EuiFormRow>
      ),
    };
  };


  _renderUTMNorthingRow = ({ value, onChange, label, dataTestSubj }) => {
    let point;
    try {
      point = utm.toLatLon(
        this.state.utm.easting,
        parseFloat(value),
        this.state.utm.zoneNum,
        this.state.utm.zoneLetter
      );
    } catch {
      point = undefined;
    }
    const isInvalid = value === '' || point === undefined;
    const error = isInvalid ? `UTM Northing is invalid` : null;
    return {
      isInvalid,
      component: (
        <EuiFormRow label={label} isInvalid={isInvalid} error={error} display="columnCompressed">
          <EuiFieldNumber
            compressed
            value={value}
            onChange={onChange}
            isInvalid={isInvalid}
            data-test-subj={dataTestSubj}
          />
        </EuiFormRow>
      ),
    };
  };

  _onSubmit = () => {
    const { lat, lon, zoom } = this.state;
    this.props.onSubmit({ lat, lon, zoom });
  };

  _renderSetViewForm() {
    const { isInvalid: isLatInvalid, component: latFormRow } = this._renderNumberFormRow({
      value: this.state.lat,
      min: -90,
      max: 90,
      onChange: this._onLatChange,
      label: i18n.translate('xpack.maps.setViewControl.latitudeLabel', {
        defaultMessage: 'Latitude',
      }),
      dataTestSubj: 'latitudeInput',
    });

    const { isInvalid: isLonInvalid, component: lonFormRow } = this._renderNumberFormRow({
      value: this.state.lon,
      min: -180,
      max: 180,
      onChange: this._onLonChange,
      label: i18n.translate('xpack.maps.setViewControl.longitudeLabel', {
        defaultMessage: 'Longitude',
      }),
      dataTestSubj: 'longitudeInput',
    });

    const { isInvalid: isMGRSInvalid, component: mgrsFormRow } = this._renderMGRSFormRow({
      value: this.state.mgrs,
      onChange: this._onMGRSChange,
      label: i18n.translate('xpack.maps.setViewControl.mgrsLabel', {
        defaultMessage: 'MGRS',
      }),
      dataTestSubj: 'mgrsInput',
    });

    const { isInvalid: isUTMZoneInvalid, component: utmZoneRow } = this._renderUTMZoneRow({
      value: (this.state.utm !== undefined) ? this.state.utm.zone : '',
      onChange: this._onUTMZoneChange,
      label: i18n.translate('xpack.maps.setViewControl.utmZoneLabel', {
        defaultMessage: 'UTM Zone',
      }),
      dataTestSubj: 'utmZoneInput',
    });

    const { isInvalid: isUTMEastingInvalid, component: utmEastingRow } = this._renderUTMEastingRow({
      value: (this.state.utm !== undefined) ? this.state.utm.easting : '',
      onChange: this._onUTMEastingChange,
      label: i18n.translate('xpack.maps.setViewControl.utmEastingLabel', {
        defaultMessage: 'UTM Easting',
      }),
      dataTestSubj: 'utmEastingInput',
    });

    const { isInvalid: isUTMNorthingInvalid, component: utmNorthingRow } = this._renderUTMNorthingRow({
      value: (this.state.utm !== undefined) ? this.state.utm.northing : '',
      onChange: this._onUTMNorthingChange,
      label: i18n.translate('xpack.maps.setViewControl.utmNorthingLabel', {
        defaultMessage: 'UTM Northing',
      }),
    });
    const { isInvalid: isZoomInvalid, component: zoomFormRow } = this._renderNumberFormRow({
      value: this.state.zoom,
      min: MIN_ZOOM,
      max: MAX_ZOOM,
      onChange: this._onZoomChange,
      label: i18n.translate('xpack.maps.setViewControl.zoomLabel', {
        defaultMessage: 'Zoom',
      }),
      dataTestSubj: 'zoomInput',
    });

    let coordinateInputs;
    if (this.state.coord === "dd") {
      coordinateInputs = (
        <Fragment>
          {latFormRow}
          {lonFormRow}
          {zoomFormRow}
        </Fragment>
      );
    } else if (this.state.coord === "dms") {
      coordinateInputs = (
        <Fragment>
          {latFormRow}
          {lonFormRow}
          {zoomFormRow}
        </Fragment>
      );
    } else if (this.state.coord === "utm") {
      coordinateInputs = (
        <Fragment>
          {utmZoneRow}
          {utmEastingRow}
          {utmNorthingRow}
          {zoomFormRow}
        </Fragment>
      );
    } else if (this.state.coord === "mgrs") {
      coordinateInputs = (
        <Fragment>
          {mgrsFormRow}
          {zoomFormRow}
        </Fragment>
      );
    }

    return (
      <EuiForm data-test-subj="mapSetViewForm" style={{ width: 240 }}>
        <EuiPopover
          panelPaddingSize="s"
          isOpen={this.state.isPopoverOpen}
          closePopover={() => {
            this.setState({ isPopoverOpen: false });
          }}
          button={
            <EuiButtonEmpty
              iconType="controlsHorizontal"
              size="xs"
              onClick={() => {
                this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
              }}>
              Coordinate System
            </EuiButtonEmpty>
          }
        >
          <EuiRadioGroup
            options={COORDINATE_SYSTEMS}
            idSelected={this.state.coord}
            onChange={this._onCoordinateSystemChange}
          />
        </EuiPopover>
        {coordinateInputs}

        <EuiSpacer size="s" />

        <EuiTextAlign textAlign="right">
          <EuiButton
            size="s"
            fill
            disabled={isLatInvalid || isLonInvalid || isZoomInvalid || isUTMEastingInvalid || isUTMNorthingInvalid || isUTMZoneInvalid || isMGRSInvalid}
            onClick={this._onSubmit}
            data-test-subj="submitViewButton"
          >
            <FormattedMessage
              id="xpack.maps.setViewControl.submitButtonLabel"
              defaultMessage="Go"
            />
          </EuiButton>
        </EuiTextAlign>
      </EuiForm>
    );
  }

  render() {
    return (
      <EuiPopover
        anchorPosition="leftUp"
        panelPaddingSize="s"
        button={
          <EuiButtonIcon
            className="mapToolbarOverlay__button"
            onClick={this._togglePopover}
            data-test-subj="toggleSetViewVisibilityButton"
            iconType="crosshairs"
            color="text"
            aria-label={i18n.translate('xpack.maps.setViewControl.goToButtonLabel', {
              defaultMessage: 'Go to',
            })}
            title={i18n.translate('xpack.maps.setViewControl.goToButtonLabel', {
              defaultMessage: 'Go to',
            })}
          />
        }
        isOpen={this.props.isSetViewOpen}
        closePopover={this.props.closeSetView}
      >
        {this._renderSetViewForm()}
      </EuiPopover>
    );
  }
}

SetViewControl.propTypes = {
  isSetViewOpen: PropTypes.bool.isRequired,
  zoom: PropTypes.number.isRequired,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
  closeSetView: PropTypes.func.isRequired,
  openSetView: PropTypes.func.isRequired,
};
