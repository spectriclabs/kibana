/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { EuiFieldText, EuiFormRow } from '@elastic/eui';

import { Adapters } from '../../../../../../../src/plugins/inspector/common/adapters';
import { IField } from '../../fields/field';
import { AbstractESSource } from '../../sources/es_source';
import { ImmutableSourceProperty } from '../../sources/source';
import { DatashaderSourceDescriptor } from '../../../../common/descriptor_types/source_descriptor_types';
import { DatashaderLayerDescriptor } from '../../../../common/descriptor_types/layer_descriptor_types';
import { DatashaderLayer } from '../../layers/datashader_layer';

import { i18n } from '@kbn/i18n';
import { getDataSourceLabel, getUrlLabel } from '../../../../../maps/common/i18n_getters';
import _ from 'lodash';

import {
  ES_GEO_FIELD_TYPE,
  FIELD_ORIGIN,
} from '../../../../../maps/common/constants';
import { SingleFieldSelect } from 'x-pack/plugins/maps/public/components/single_field_select';
import { getIndexPatternService, getIndexPatternSelectComponent } from 'x-pack/plugins/maps/public/kibana_services';
import { GeoIndexPatternSelect } from 'x-pack/plugins/maps/public/components/geo_index_pattern_select';

import { indexPatterns } from 'src/plugins/data/public';
import { CATEGORICAL_DATA_TYPES, COLOR_MAP_TYPE } from '../../../../../maps/common/constants';
import { ESDocField } from 'x-pack/plugins/maps/public/classes/fields/es_doc_field';

import { FieldFormat } from 'src/plugins/field_formats/common/field_format';

import { registerSource } from 'x-pack/plugins/maps/public/classes/sources/source_registry';
import { getDatashader } from 'x-pack/plugins/maps/public/kibana_services';
import { LayerDescriptor } from 'x-pack/plugins/maps/common';
import { IndexPattern } from 'src/plugins/data_views/common/data_views';

function filterGeoField(field) {
  return [ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE].includes(field.type);
}

function getDatashaderLayerSettings() {
  return getDatashader();
}

const NUMBER_DATA_TYPES = [ "number" ]

export class DatashaderSource extends AbstractESSource {
  static type = 'Datashader';
  static title = i18n.translate('xpack.maps.source.ems_xyzTitle', {
    defaultMessage: 'Datashader Map Service',
  });
  static description = i18n.translate('xpack.maps.source.ems_xyzDescription', {
    defaultMessage: 'Datashader map service with custom configuration',
  });
  static icon = 'grid';
  _descriptor: DatashaderSourceDescriptor;

  static createDescriptor(descriptor: Partial<DatashaderSourceDescriptor>): DatashaderSourceDescriptor {
    return {
      urlTemplate: descriptor.urlTemplate || '',
      indexTitle: descriptor.indexTitle || '',
      timeFieldName: descriptor.timeFieldName || '',
      type: DatashaderSource.type,
      indexPatternId: descriptor.indexPatternId || '',
      geoField: descriptor.geoField || '',
      applyGlobalQuery: descriptor.applyGlobalQuery || true,
    } as DatashaderSourceDescriptor;
  }

  static renderEditor({ onPreviewSource, inspectorAdapters as Adapters }) {
    const onSourceConfigChange = (sourceConfig: DatashaderSourceDescriptor | null) => {
      const sourceDescriptor = DatashaderSource.createDescriptor(sourceConfig);
      const source = new DatashaderSource(sourceDescriptor, inspectorAdapters);
      onPreviewSource(source);
    };

    const settings = getDatashaderLayerSettings();

    return <DatashaderEditor settings={settings} onSourceConfigChange={onSourceConfigChange} />;
  }

  constructor(descriptor: DatashaderSourceDescriptor, inspectorAdapters: Adapters) {
    super(
      {
        ...descriptor,
        applyGlobalQuery: _.get(descriptor, 'applyGlobalQuery', true),
      },
      inspectorAdapters
    );

    this._descriptor = descriptor;
  }

  async getImmutableProperties(): Promise<ImmutableSourceProperty[]> {
    return [
      { label: getDataSourceLabel(), value: DatashaderSource.title },
      { label: getUrlLabel(), value: this._descriptor.urlTemplate },
      { label: "Index", value: this._descriptor.indexTitle },
      { label: "Location field", value: this._descriptor.geoField },
    ];
  }

  _createDefaultLayerDescriptor(options: Partial<LayerDescriptor>) {
    return DatashaderLayer.createDescriptor({
      sourceDescriptor: this._descriptor,
      ...options,
    });
  }

  createDefaultLayer(options: Partial<LayerDescriptor>) {
    return new DatashaderLayer({
      layerDescriptor: this._createDefaultLayerDescriptor(options),
      source: this,
    });
  }

  async getDisplayName() {
    return this._descriptor.urlTemplate;
  }

  async getFieldFormatter(field: IField): Promise<FieldFormat | null> {
    let indexPattern;

    try {
      indexPattern = await this.getIndexPattern();
    } catch (error) {
      return null;
    }

    const fieldFromIndexPattern = indexPattern.fields.getByName(field.getRootName());
    
    if (!fieldFromIndexPattern) {
      return null;
    }

    return indexPattern.getFormatterForField(fieldFromIndexPattern);
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

  getGeoFieldName(): string {
    return this._descriptor.geoField || '';
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

  // Have to make this async to satisfy
  // the ISource interface.
  async isTimeAware(): Promise<boolean> {
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

  getIndexPatternIds(): string[] {
    return [this._descriptor.indexPatternId];
  }


  getQueryableIndexPatternIds() {
    if (this.getApplyGlobalQuery() || true) {
      return [this._descriptor.indexPatternId];
    }
    return [];
  }

  async getIndexPattern(): Promise<IndexPattern> {
    if (this.indexPattern) {
      return this.indexPattern;
    }

    try {
      this.indexPattern = await getIndexPatternService().get(this._descriptor.indexPatternId);
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

  getId(): string {
    return this._descriptor.id;
  }

  getIndexPatternId(): string {
    return this._descriptor.indexPatternId;
  }

  createField({ fieldName }: { fieldName: string}): ESDocField {
    return new ESDocField({
      fieldName,
      source: this,
      origin: FIELD_ORIGIN.SOURCE,
    });
  }

  async getCategoricalFields(): Promise<IField[]> {
    try {
      const indexPattern = await this.getIndexPattern();
      const aggFields: IField[] = [];
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

      return aggFields.map((field: IField) => {
        return this.createField({ fieldName: field.getName() });
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

export class DatashaderEditor extends React.Component {
  state = {
    isLoadingIndexPattern: false,
    noGeoIndexPatternsExist: false,
    datashaderUrl: '',
    canPreview: false,
    ...RESET_INDEX_PATTERN_STATE,
  };

  constructor(props) {
    super(props);

    if (this.props && this.props.settings && this.props.settings.url) {
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

  onIndexPatternSelect = indexPattern => {
    this.setState(
      {
        indexPatternId: ( indexPattern ) ? indexPattern.id : null,
      },
      this.loadIndexPattern(indexPattern)
    );
  };

  loadIndexPattern = indexPattern => {
    this.setState(
      {
        isLoadingIndexPattern: true,
        ...RESET_INDEX_PATTERN_STATE,
      },
      this.debouncedLoad.bind(null, ( indexPattern ) ? indexPattern.id : null)
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

    let indexPattern: IndexPattern;
    try {
      indexPattern = await getIndexPatternService().get(indexPatternId);
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

    //make default selection
    const geoFields = indexPattern.fields
      .filter(field => !indexPatterns.isNestedField(field))
      .filter(filterGeoField);

    this.setState({
      indexPattern: indexPattern,
      isLoadingIndexPattern: false,
      filterByMapBounds: !indexHasSmallDocCount, // Turn off filterByMapBounds when index contains a limited number of documents
      showFilterByBoundsSwitch: indexHasSmallDocCount,
      canPreview: canPreview,
      geoFields: geoFields
    });

    () => this._sourceConfigChange({
      urlTemplate: this.state.datashaderUrl,
      indexTitle: indexPattern.title,
      indexPatternId: indexPattern.id,
      timeFieldName: indexPattern.timeFieldName,
      geoField: this.state.geoField
    })

    const defaultGeospatialField = this.props.settings ? this.props.settings.defaultGeospatialField : null;
    if (!this.state.geoField) {
      if (defaultGeospatialField && _.find(geoFields, {name: defaultGeospatialField})) {
        this.onGeoFieldSelect(defaultGeospatialField);
      } else {
        // if a geoField isn't already selected use the first in the list
        if (geoFields[0]) {
          this.onGeoFieldSelect(geoFields[0].name);
        }
      }
    }

    }, 300);

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
          fields={this.state.geoFields}
        />
      </EuiFormRow>
    );
  }

  render() {
    const { attributionText, attributionUrl } = this.state;
    const IndexPatternSelect = getIndexPatternSelectComponent();

    return (
      <Fragment>
        <EuiFormRow label="Url">
          <EuiFieldText
            placeholder={'https://a.datashader.com'}
            value={this.state.datashaderUrl}
            onChange={e => this._handleDataShaderURLInputChange(e)}
          />
        </EuiFormRow>
        <GeoIndexPatternSelect
          value={this.state.indexPattern ? this.state.indexPattern.id : ''}
          onChange={this.onIndexPatternSelect}
        />
        {this._renderGeoSelect()}
      </Fragment>
    );
  }
}

registerSource({
  ConstructorFunction: DatashaderSource,
  type: DatashaderSource.type,
});