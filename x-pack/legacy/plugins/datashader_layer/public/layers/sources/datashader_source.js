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
import chrome from 'ui/chrome';
const { IndexPatternSelect } = npStart.plugins.data.ui;

import { isNestedField } from '../../../../../../../src/plugins/data/public';
import { CATEGORICAL_DATA_TYPES, COLOR_MAP_TYPE } from '../../../../maps/common/constants';
import { ESDocField } from '../../../../maps/public/layers/fields/es_doc_field';

const RESET_INDEX_PATTERN_STATE = {
  indexPattern: undefined,
  indexTitle: undefined,
  timeFieldName: undefined,
  geoField: undefined,
};

function filterGeoField(field) {
  return [ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE].includes(field.type);
}

function getDatashaderLayerSettings() {
  return chrome.getInjected('datashader');
}

const NUMBER_DATA_TYPES = [ "number" ]

export class DatashaderSource extends AbstractTMSSource {
  static type = 'Datashader';
  static title = i18n.translate('xpack.maps.source.ems_xyzTitle', {
    defaultMessage: 'Datashader Map Service',
  });
  static description = i18n.translate('xpack.maps.source.ems_xyzDescription', {
    defaultMessage: 'Datashader map service with custom configuration',
  });
  static icon = 'grid';

  static createDescriptor({ urlTemplate, indexTitle, indexPatternId, timeFieldName, geoField, applyGlobalQuery }) {
    return {
      type: DatashaderSource.type,
      applyGlobalQuery: applyGlobalQuery,
      urlTemplate,
      indexTitle,
      indexPatternId,
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

    const settings = getDatashaderLayerSettings();

    return <DatashaderEditor settings={settings} nSourceConfigChange={onSourceConfigChange} />;
  }

  constructor(descriptor, inspectorAdapters) {
    super(
      {
        ...descriptor,
        applyGlobalQuery: _.get(descriptor, 'applyGlobalQuery', true),
      },
      inspectorAdapters
    );
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
      { label: "Index", value: this._descriptor.indexTitle },
      { label: "Location field", value: this._descriptor.geoField },
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

  isFieldAware() {
    return true;
  }

  isRefreshTimerAware() {
    return true;
  }

  isESSource() {
    return true;
  }

  isTimeAware() {
    return true;
  }
  
  isQueryAware() {
    return true;
  }

  isFilterByMapBounds() {
    return true;
  }

  isFilterByMapBoundsConfigurable() {
    return false;
  }

  getIndexPatternIds() {
    return [this._descriptor.indexPatternId];
  }


  getQueryableIndexPatternIds() {
    if (this.getApplyGlobalQuery() || true) {
      return [this._descriptor.indexPatternId];
    }
    return [];
  }

  async getIndexPattern() {
    if (this.indexPattern) {
      return this.indexPattern;
    }

    try {
      this.indexPattern = await indexPatternService.get(this._descriptor.indexPatternId);
      return this.indexPattern;
    } catch (error) {
      throw new Error(
        i18n.translate('xpack.maps.source.esSource.noIndexPatternErrorMessage', {
          defaultMessage: `Unable to find Index pattern for id: {indexPatternId}`,
          values: { indexPatternId: this._descriptor.indexPatternId },
        })
      );
    }
  }

  createField({ fieldName }) {
    return new ESDocField({
      fieldName,
      source: this,
    });
  }

  async getCategoricalFields() {
    try {
      const indexPattern = await this.getIndexPattern();
      const aggFields = [];
      CATEGORICAL_DATA_TYPES.forEach(dataType => {
        indexPattern.fields.getByType(dataType).forEach(field => {
          if (field.aggregatable) {
            aggFields.push(field);
          }
        });
      });
      NUMBER_DATA_TYPES.forEach(dataType => {
        indexPattern.fields.getByType(dataType).forEach(field => {
          aggFields.push(field);
        });
      });
      return aggFields.map(field => {
        return this.createField({ fieldName: field.name });
      });
    } catch (error) {
      return [];
    }
  }

  async getNumberFields() {
    try {
      const indexPattern = await this.getIndexPattern();
      const numberFields = [];
      NUMBER_DATA_TYPES.forEach(dataType => {
        indexPattern.fields.getByType(dataType).forEach(field => {
          numberFields.push(field);
        });
      });
      return numberFields.map(field => {
        return this.createField({ fieldName: field.name });
      });
    } catch (error) {
      return [];
    }
  }

}

class DatashaderEditor extends React.Component {
  state = {
    isLoadingIndexPattern: false,
    noGeoIndexPatternsExist: false,
    datashaderUrl: '',
    canPreview: false,
    ...RESET_INDEX_PATTERN_STATE,
  };

  constructor(props) {
    super(props);

    if (this.props.settings.url) {
      this.state.datashaderUrl = this.props.settings.url;
    }
  }
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

  _handleDataShaderURLInputChange(e) {
    const url = e.target.value;

    let canPreview = true;
    if (!this.state.indexPattern) {
      canPreview = false;
    }
    if (!url) {
      canPreview = false;
    }
    if (!this.state.geoField) {
      canPreview = false;
    }

    this.setState(
      {
        datashaderUrl: url,
        canPreview: canPreview,
      },
      () => this._sourceConfigChange({
        urlTemplate: url,
        indexTitle: this.state.indexPattern ? this.state.indexPattern.title : undefined,
        indexPatternId: this.state.indexPattern ? this.state.indexPattern.id : undefined,
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
    if (!this.state.datashaderUrl) {
      canPreview = false;
    }
    if (!geoField) {
      canPreview = false;
    }

    this.setState(
      {
        geoField: geoField,
        canPreview: canPreview,
      },
      () => this._sourceConfigChange({
        urlTemplate: this.state.datashaderUrl,
        indexPatternId: this.state.indexPattern ? this.state.indexPattern.id : undefined,
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
    if (!this.state.datashaderUrl) {
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
      urlTemplate: this.state.datashaderUrl,
      indexTitle: indexPattern.title,
      indexPatternId: indexPattern.id,
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
            value={this.state.datashaderUrl}
            onChange={e => this._handleDataShaderURLInputChange(e)}
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