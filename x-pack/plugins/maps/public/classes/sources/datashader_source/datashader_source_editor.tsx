/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/consistent-type-definitions */

import React, { Component, ChangeEvent } from 'react';
import _ from 'lodash';
import { EuiFormRow, EuiFieldText, EuiPanel } from '@elastic/eui';
import { IndexPattern } from '../../../../../../../src/plugins/data_views/common/data_views';
import { GeoIndexPatternSelect } from '../../../../../maps/public/components/geo_index_pattern_select';
import { loadIndexDocCount } from './util/load_index_doc_count';
import {  getIndexPatternService, getIndexPatternSelectComponent } from '../../../../../maps/public/kibana_services';
import {
  DEFAULT_MAX_RESULT_WINDOW,
  ES_GEO_FIELD_TYPE,
} from '../../../../../maps/common/constants';

export type DatashaderSourceConfig = {
  type: string;
  applyGlobalQuery: boolean;
  urlTemplate: string;
  indexTitle: string;
  indexPatternId: string;
  timeFieldName : string;
  geoField: string;
};

function filterGeoField(field) {
  return [ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE].includes(field.type);
}

interface Props {
  onSourceConfigChange: (sourceConfig: DatashaderSourceConfig | null) => void;
}

interface State {
  isLoadingIndexPattern: boolean;
  noGeoIndexPatternsExist: boolean;
  datashaderUrl: string;
  canPreview: boolean;
  indexPattern: IndexPattern | undefined;
  indexPatternId: string;
  indexTitle: string | undefined;
  timeFieldName: string | undefined;
  geoField: string | undefined;
  applyGlobalQuery: boolean | undefined;
}

const DEFAULT_INDEX_PATTERN_STATE = {
  indexPattern: undefined,
  indexPatternId: '',
  indexTitle: undefined,
  timeFieldName: undefined,
  geoField: undefined,
}

export class DatashaderSourceEditor extends Component<Props, State> {
  private _isMounted = false;
  
  state = {
    isLoadingIndexPattern: false,
    noGeoIndexPatternsExist: false,
    datashaderUrl: '',
    canPreview: false,
    applyGlobalQuery: false,
    ...DEFAULT_INDEX_PATTERN_STATE,
  };

  _sourceConfigChange = _.debounce(updatedSourceConfig => {
    if (this.state.canPreview) {
      this.props.onSourceConfigChange(updatedSourceConfig);
    }
  }, 2000);

  _previewLayer = _.debounce(() => {
    const datashaderUrl = this.state.datashaderUrl || '';
    const indexTitle = this.state.indexTitle || '';
    const timeFieldName = this.state.timeFieldName || '';
    const geoField = this.state.geoField || '';
    const applyGlobalQuery = this.state.applyGlobalQuery || false;
    const indexPatternId = _.get(this.state.indexPattern, 'id', '');

    const canPreview = this.state.canPreview;
    const urlIsValid = datashaderUrl.length > 0;
    const indexTitleIsValid = indexTitle.length > 0;
    const timeFieldNameIsValid = timeFieldName.length > 0;
    const geoFieldIsValid = geoField.length > 0;
    const indexPatternIdIsValid = indexPatternId.length > 0;
    
    if (urlIsValid && canPreview &&
        indexTitleIsValid && timeFieldNameIsValid &&
        geoFieldIsValid && indexPatternIdIsValid) {
      this.props.onSourceConfigChange({
        type: 'Datashader',
        applyGlobalQuery: applyGlobalQuery,
        urlTemplate: datashaderUrl,
        indexTitle: indexTitle,
        indexPatternId: 'bar',
        timeFieldName: timeFieldName,
        geoField: geoField,
      });
    } else {
      this.props.onSourceConfigChange(null);
    }
  }, 500);

  _onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    let canPreview = true;

    // determine if we can preview
    if (!this.state.indexPattern) { canPreview = false; }
    if (!this.state.geoField) { canPreview = false; }
    if (!url) { canPreview = false; }

    this.setState({
      datashaderUrl: event.target.value,
      canPreview: canPreview,
    },
    this._previewLayer
    );
  };

  _loadIndexPattern = _.debounce(async () => {
    const indexPatternId = this.state.indexPatternId;

    if (!indexPatternId || indexPatternId.length === 0) {
      return;
    }
    
    const datashaderUrl = this.state.datashaderUrl;
    const geoField = this.state.geoField;
    let indexPattern: IndexPattern;
    
    try {
      indexPattern = await getIndexPatternService().get(indexPatternId);
    } catch (err) {
      // index pattern no longer exists
      return;
    }

    if (indexPattern === undefined) {
      return;
    }

    const indexPatternTitle = _.get(indexPattern, 'title', '');

    if (indexPatternTitle.length === 0) {
      return;
    }

    let indexHasSmallDocCount = false;

    try {
      const indexDocCount = await loadIndexDocCount(indexPatternTitle);
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
    if (!indexPattern) { canPreview = false; }
    if (!datashaderUrl) { canPreview = false; }
    if (!geoField) { canPreview = false; }

    // make default selection
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

  _onIndexPatternSelect = (indexPattern: IndexPattern) => {
    this.setState(
      {
        isLoadingIndexPattern: true,
        indexPatternId: indexPattern.id,
        ...DEFAULT_INDEX_PATTERN_STATE,
      },
      this._loadIndexPattern
    );
  };

  render() {
    return (
      <EuiPanel>
        <EuiFormRow label="Url">
          <EuiFieldText
            placeholder={'https://a.datashader.com'}
            value={this.state.datashaderUrl}
            onChange={this._onUrlChange}
          />
        </EuiFormRow>
        <GeoIndexPatternSelect
          value={_.get(this.state.indexPattern, 'id', '')}
          onChange={this._onIndexPatternSelect}
        />
        {this._renderGeoSelect()}
      </EuiPanel>
    );
  }
}
