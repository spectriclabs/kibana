/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { EuiFieldText, EuiFormRow } from '@elastic/eui';

import { AbstractTMSSource } from '../../../../maps/public/layers/sources/tms_source';
import { DatashaderLayer } from '../datashader_layer';
//import { TileLayer } from '../tile_layer';

import { i18n } from '@kbn/i18n';
import { getDataSourceLabel, getUrlLabel } from '../../../../maps/common/i18n_getters';
import _ from 'lodash';

import {
  ES_GEO_FIELD_TYPE
} from '../../../../maps/common/constants';
import { SingleFieldSelect } from '../../../../maps/public/components/single_field_select';
import { indexPatternService } from '../../../../maps/public/kibana_services';
import { npStart } from 'ui/new_platform';
const { IndexPatternSelect } = npStart.plugins.data.ui;

import { isNestedField } from '../../../../../../../src/plugins/data/public';

const RESET_INDEX_PATTERN_STATE = {
  indexPattern: undefined,
  indexTitle: undefined,
  timeFieldName: undefined,
  geoField: undefined,
};

function filterGeoField(field) {
  return [ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE].includes(field.type);
}

export class DatashaderSource extends AbstractTMSSource {
  static type = 'Datashader';
  static title = i18n.translate('xpack.maps.source.ems_xyzTitle', {
    defaultMessage: 'Datashader Map Service',
  });
  static description = i18n.translate('xpack.maps.source.ems_xyzDescription', {
    defaultMessage: 'Datashader map service with custom configuration',
  });
  static icon = 'grid';

  static createDescriptor({ urlTemplate, indexTitle, timeFieldName, geoField }) {
    return {
      type: DatashaderSource.type,
      urlTemplate,
      indexTitle,
      timeFieldName,
      geoField,
    };
  }

  static renderEditor({ onPreviewSource, inspectorAdapters }) {
    const onSourceConfigChange = sourceConfig => {
      const sourceDescriptor = DatashaderSource.createDescriptor(sourceConfig);
      const source = new DatashaderSource(sourceDescriptor, inspectorAdapters);
      onPreviewSource(source);
    };
    return <DatashaderEditor onSourceConfigChange={onSourceConfigChange} />;
  }

  /*
  renderSourceSettingsEditor({ onChange }) {
    return (
      <DatashaderSourceEditor
        source={this}
        onChange={onChange}
      />
    );
  }
  */

  async getImmutableProperties() {
    return [
      { label: getDataSourceLabel(), value: DatashaderSource.title },
      { label: getUrlLabel(), value: this._descriptor.urlTemplate },
    ];
  }

  _createDefaultLayerDescriptor(options) {
    return DatashaderLayer.createDescriptor({
      sourceDescriptor: this._descriptor,
      ...options,
    });
  }

  createDefaultLayer(options) {
    return new DatashaderLayer({
      layerDescriptor: this._createDefaultLayerDescriptor(options),
      source: this,
    });
  }

  async getDisplayName() {
    return this._descriptor.urlTemplate;
  }

  getAttributions() {
    const { attributionText, attributionUrl } = this._descriptor;
    const attributionComplete = !!attributionText && !!attributionUrl;

    return attributionComplete
      ? [
          {
            url: attributionUrl,
            label: attributionText,
          },
        ]
      : [];
  }

  getUrlTemplate() {
    return this._descriptor.urlTemplate;
  }

  getIndexTitle() {
    return this._descriptor.indexTitle;
  }

  getTimeFieldName() {
    return this._descriptor.timeFieldName;
  }

  getGeoField() {
    return this._descriptor.geoField;
  }

  isTimeAware() {
    return true;
  }
  
  isQueryAware() {
    return true;
  }

}

class DatashaderEditor extends React.Component {
  state = {
    isLoadingIndexPattern: false,
    noGeoIndexPatternsExist: false,
    tmsInput: '',
    canPreview: false,
    ...RESET_INDEX_PATTERN_STATE,
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadIndexPattern(this.state.indexPatternId);
  }

  _sourceConfigChange = _.debounce(updatedSourceConfig => {
    if (this.state.canPreview) {
      this.props.onSourceConfigChange(updatedSourceConfig);
    }
  }, 2000);

  _handleTMSInputChange(e) {
    const url = e.target.value;

    let canPreview = true;
    if (!this.state.indexPattern) {
      canPreview = false;
    }
    if (!this.state.tmsInput) {
      canPreview = false;
    }
    if (!this.state.geoField) {
      canPreview = false;
    }

    this.setState(
      {
        tmsInput: url,
        canPreview: canPreview,
      },
      () => this._sourceConfigChange({
        urlTemplate: url,
        indexTitle: this.state.indexPattern ? this.state.indexPattern.title : undefined,
        timeFieldName: this.state.indexPattern ? this.state.indexPattern.timeFieldName : undefined,
        geoField: this.state.geoField
      })
    );

  }

  _onNoIndexPatterns = () => {
    this.setState({ noGeoIndexPatternsExist: true });
  };

  onIndexPatternSelect = indexPatternId => {
    this.setState(
      {
        indexPatternId,
      },
      this.loadIndexPattern(indexPatternId)
    );
  };

  loadIndexPattern = indexPatternId => {
    this.setState(
      {
        isLoadingIndexPattern: true,
        ...RESET_INDEX_PATTERN_STATE,
      },
      this.debouncedLoad.bind(null, indexPatternId)
    );
  };

  loadIndexDocCount = async indexPatternTitle => {
    const { count } = await kfetch({
      pathname: `../${GIS_API_PATH}/indexCount`,
      query: {
        index: indexPatternTitle,
      },
    });
    return count;
  };

  onGeoFieldSelect = geoField => {
    let canPreview = true;
    if (!this.state.indexPattern) {
      canPreview = false;
    }
    if (!this.state.tmsInput) {
      canPreview = false;
    }
    if (!this.state.geoField) {
      canPreview = false;
    }

    this.setState(
      {
        geoField: geoField,
        canPreview: canPreview,
      },
      () => this._sourceConfigChange({
        urlTemplate: this.state.tmsInput,
        indexTitle: this.state.indexPattern ? this.state.indexPattern.title : undefined,
        timeFieldName: this.state.indexPattern ? this.state.indexPattern.timeFieldName : undefined,
        geoField: geoField
      })
    );
  };

  debouncedLoad = _.debounce(async indexPatternId => {
    if (!indexPatternId || indexPatternId.length === 0) {
      return;
    }

    let indexPattern;
    try {
      indexPattern = await indexPatternService.get(indexPatternId);
    } catch (err) {
      // index pattern no longer exists
      return;
    }

    let indexHasSmallDocCount = false;
    try {
      const indexDocCount = await this.loadIndexDocCount(indexPattern.title);
      indexHasSmallDocCount = indexDocCount <= DEFAULT_MAX_RESULT_WINDOW;
    } catch (error) {
      // retrieving index count is a nice to have and is not essential
      // do not interrupt user flow if unable to retrieve count
    }

    if (!this._isMounted) {
      return;
    }

    // props.indexPatternId may be updated before getIndexPattern returns
    // ignore response when fetched index pattern does not match active index pattern
    if (indexPattern.id !== indexPatternId) {
      return;
    }

    let canPreview = true;
    if (!this.state.indexPattern) {
      canPreview = false;
    }
    if (!this.state.tmsInput) {
      canPreview = false;
    }
    if (!this.state.geoField) {
      canPreview = false;
    }

    this.setState({
      indexPattern: indexPattern,
      isLoadingIndexPattern: false,
      filterByMapBounds: !indexHasSmallDocCount, // Turn off filterByMapBounds when index contains a limited number of documents
      showFilterByBoundsSwitch: indexHasSmallDocCount,
      canPreview: canPreview
    });

    () => this._sourceConfigChange({
      urlTemplate: this.state.tmsInput,
      indexTitle: indexPattern.title,
      timeFieldName: indexPattern.timeFieldName,
      geoField: this.state.geoField
    })

    //make default selection
    const geoFields = indexPattern.fields
      .filter(field => !isNestedField(field))
      .filter(filterGeoField);
    if (geoFields[0]) {
      this.onGeoFieldSelect(geoFields[0].name);
    }

    }, 300);

  _renderNoIndexPatternWarning() {
    if (!this.state.noGeoIndexPatternsExist) {
      return null;
    }

    return (
      <Fragment>
        <NoIndexPatternCallout />
        <EuiSpacer size="s" />
      </Fragment>
    );
  }

  _renderGeoSelect() {
    if (!this.state.indexPattern) {
      return;
    }

    return (
      <EuiFormRow
        label={i18n.translate('xpack.maps.source.esSearch.geofieldLabel', {
          defaultMessage: 'Geospatial field',
        })}
      >
        <SingleFieldSelect
          placeholder={i18n.translate('xpack.maps.source.esSearch.selectLabel', {
            defaultMessage: 'Select geo field',
          })}
          value={this.state.geoField}
          onChange={this.onGeoFieldSelect}
          filterField={filterGeoField}
          fields={
            this.state.indexPattern
              ? this.state.indexPattern.fields.filter(field => !isNestedField(field))
              : undefined
          }
        />
      </EuiFormRow>
    );
  }

  render() {
    const { attributionText, attributionUrl } = this.state;

    return (
      <Fragment>
        {this._renderNoIndexPatternWarning()}
        <EuiFormRow label="Url">
          <EuiFieldText
            placeholder={'https://a.datashader.com'}
            onChange={e => this._handleTMSInputChange(e)}
          />
        </EuiFormRow>
        <EuiFormRow
          label={i18n.translate('xpack.maps.source.esSearch.indexPatternLabel', {
            defaultMessage: 'Index pattern',
          })}
        >
          <IndexPatternSelect
            isDisabled={this.state.noGeoIndexPatternsExist}
            indexPatternId={this.state.indexPatternId}
            onChange={this.onIndexPatternSelect}
            placeholder={i18n.translate(
              'xpack.maps.source.esSearch.selectIndexPatternPlaceholder',
              {
                defaultMessage: 'Select index pattern',
              }
            )}
            fieldTypes={[ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE]}
            onNoIndexPatterns={this._onNoIndexPatterns}
          />
        </EuiFormRow>

        {this._renderGeoSelect()}
      </Fragment>
    );
  }
}