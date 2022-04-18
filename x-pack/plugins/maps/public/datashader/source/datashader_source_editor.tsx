/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/consistent-type-definitions */

import React, { Component, ChangeEvent } from 'react';
import _ from 'lodash';
import { EuiPanel } from '@elastic/eui';
import { DatashaderGeoFieldEditorField } from './datashader_geo_field_editor_field';
import { DatashaderGeoIndexEditorField } from './datashader_geo_index_editor_field';
import { DatashaderUrlEditorField } from './datashader_url_editor_field';
import { loadIndexDocCount } from './util/load_index_doc_count';
import {  getIndexPatternService } from '../../kibana_services';
import {
  DEFAULT_MAX_RESULT_WINDOW,
  ES_GEO_FIELD_TYPE,
} from '../../../common/constants';
import { DatashaderConfigType } from '../../../config';
import { IndexPattern } from '../../../../../../src/plugins/data_views/common/data_views';
import { indexPatterns } from '../../../../../../src/plugins/data/public';
import { DataViewField } from '../../../../../../src/plugins/data_views/common/fields/data_view_field';

function filterGeoField(field: DataViewField) {
  return [ES_GEO_FIELD_TYPE.GEO_POINT.valueOf(), ES_GEO_FIELD_TYPE.GEO_SHAPE.valueOf()].includes(field.type);
}

export type DatashaderSourceConfig = {
  urlTemplate: string;
  indexTitle: string;
  indexPatternId: string;
  timeFieldName: string;
  geoField: string;
  applyGlobalQuery: boolean;
  applyGlobalTime: boolean;
}

interface Props {
  settings: DatashaderConfigType,
  onSourceConfigChange: (sourceConfig: DatashaderSourceConfig | null) => void;
}

interface State {
  isLoadingIndexPattern: boolean;
  noGeoIndexPatternsExist: boolean;
  filterByMapBounds: boolean;
  showFilterByBoundsSwitch: boolean;
  datashaderUrl: string;
  canPreview: boolean;
  indexPattern: IndexPattern | undefined;
  indexPatternId: string;
  indexTitle: string;
  timeFieldName: string;
  geoField: string;
  geoFields: DataViewField[];
  applyGlobalQuery: boolean;
  applyGlobalTime: boolean;
}

export class DatashaderSourceEditor extends Component<Props, State> {
  private _isMounted = false;
  
  state: State = {
    isLoadingIndexPattern: false,
    noGeoIndexPatternsExist: false,
    filterByMapBounds: true,
    showFilterByBoundsSwitch: true,
    datashaderUrl: '',
    canPreview: false,
    applyGlobalQuery: false,
    applyGlobalTime: false,
    indexPattern: undefined,
    indexPatternId: '',
    indexTitle: '',
    timeFieldName: '',
    geoField: '',
    geoFields: [],
  };

  _debounceSourceConfigChange = _.debounce((canPreview: boolean) => {
    if (canPreview) {
      this.props.onSourceConfigChange({
        urlTemplate: this.state.datashaderUrl,
        indexTitle: this.state.indexTitle,
        timeFieldName: this.state.timeFieldName,
        indexPatternId: this.state.indexPatternId,
        geoField: this.state.geoField,
        applyGlobalQuery: this.state.applyGlobalQuery,
        applyGlobalTime: this.state.applyGlobalTime,
      } as DatashaderSourceConfig);
    } else {
      this.props.onSourceConfigChange(null);
    }
  }, 2000);

  _onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    let canPreview = true;

    // determine if we can preview
    if (!this.state.indexPattern) { canPreview = false; }
    if (this.state.geoField.length === 0) { canPreview = false; }
    if (url.length === 0) { canPreview = false; }

    this.setState(
      { datashaderUrl: event.target.value },
      // We have no way to give params to the setState
      // callback so we pass a closure with the params
      // we want instead.
      () => this._debounceSourceConfigChange(canPreview)
    );
  };

  onGeoFieldSelect = (geoField: string | undefined) => {
    this.setState(
      {
        geoField: geoField || '',
      },
      () => this.props.onSourceConfigChange({
        urlTemplate: this.state.datashaderUrl,
        indexTitle: _.get(this.state.indexPattern, 'title', ''),
        timeFieldName: _.get(this.state.indexPattern, 'timeFieldName', ''),
        indexPatternId: _.get(this.state.indexPattern, 'id', ''),
        geoField: geoField,
      } as DatashaderSourceConfig)
    );
  };

  _setIndexPatternGeoField = (geoFields: DataViewField[]) => {
    this.props.onSourceConfigChange({
      urlTemplate: this.state.datashaderUrl,
      indexTitle: _.get(this.state.indexPattern, 'title', ''),
      timeFieldName: _.get(this.state.indexPattern, 'timeFieldName', ''),
      indexPatternId: _.get(this.state.indexPattern, 'id', ''),
      geoField: this.state.geoField
    } as DatashaderSourceConfig);
    
    if (this.state.geoField.length === 0) {
      //const defaultGeospatialField = this.props.settings.defaultGeospatialField;
      const defaultGeospatialField = "geo_center";

      if (defaultGeospatialField &&
          _.find(this.state.geoFields, {name: defaultGeospatialField})) {
        this.onGeoFieldSelect(defaultGeospatialField);
      } else {
        // if a geoField isn't already selected use the first in the list
        if (geoFields[0]) {
          this.onGeoFieldSelect(geoFields[0].name);
        }
      }
    }
  }

  _loadIndexPattern = _.debounce(async () => {
    const indexPatternId = this.state.indexPatternId;

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

    // make default selection
    const geoFields = indexPattern.fields
      .filter(field => !indexPatterns.isNestedField(field))
      .filter(filterGeoField);

    this.setState({
      indexPattern: indexPattern,
      isLoadingIndexPattern: false,
      filterByMapBounds: !indexHasSmallDocCount, // Turn off filterByMapBounds when index contains a limited number of documents
      showFilterByBoundsSwitch: indexHasSmallDocCount,
      geoFields: geoFields,
    }, () => this._setIndexPatternGeoField(geoFields));
  }, 300);

  _onGeoIndexPatternSelect = (indexPattern: IndexPattern) => {
    this.setState(
      {
        isLoadingIndexPattern: true,
        indexPatternId: _.get(indexPattern, 'id', ''),
        indexPattern: undefined,
        indexTitle: '',
        timeFieldName: '',
        geoField: '',
        geoFields: [],
      },
      this._loadIndexPattern
    );
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadIndexPattern();
  }

  render() {
    return (
      <EuiPanel>
        <DatashaderUrlEditorField
          value={this.state.datashaderUrl}
          onChange={this._onUrlChange}
        />
        <DatashaderGeoIndexEditorField
          value={_.get(this.state.indexPattern, 'id', '')}
          onChange={this._onGeoIndexPatternSelect}
        />
        <DatashaderGeoFieldEditorField
          value={this.state.geoField}
          fields={this.state.geoFields}
          indexPatternDefined={this.state.indexPattern !== undefined}
          onChange={(name: string | undefined) => this.onGeoFieldSelect(name)}
        />
      </EuiPanel>
    );
  }
}
