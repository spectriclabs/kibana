/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import { i18n } from '@kbn/i18n';

import { DatashaderSourceConfig } from './datashader_source_editor';
import { AbstractESSource } from '../../classes/sources/es_source';
import { ImmutableSourceProperty } from '../../classes/sources/source';
import { registerSource } from '../../classes/sources/source_registry';
import { ESDocField } from '../../classes/fields/es_doc_field';
import { IField } from '../../classes/fields/field';
import { DatashaderLayer } from '../layer/datashader_layer';
import { LayerDescriptor } from '../../../common';
import { getIndexPatternService } from '../../kibana_services';
import {
  CATEGORICAL_DATA_TYPES,
  FIELD_ORIGIN,
} from '../../../common/constants';
import { DatashaderSourceDescriptor } from '../../../common/descriptor_types/source_descriptor_types';
import { getDataSourceLabel, getUrlLabel } from '../../../common/i18n_getters';
import { IndexPattern } from '../../../../../../src/plugins/data_views/common/data_views';
import { FieldFormat } from '../../../../../../src/plugins/field_formats/common/field_format';
import { DataViewField } from '../../../../../../src/plugins/data/common';

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

  static createDescriptor(settings: DatashaderSourceConfig): DatashaderSourceDescriptor {
    return {
      urlTemplate: settings.urlTemplate,
      indexTitle: settings.indexTitle,
      timeFieldName: settings.timeFieldName,
      type: DatashaderSource.type,
      indexPatternId: settings.indexPatternId,
      geoField: settings.geoField,
      applyGlobalQuery: settings.applyGlobalQuery,
      applyGlobalTime: settings.applyGlobalTime,
    } as DatashaderSourceDescriptor;
  }

  // This must match the constructor type signature expected
  // by registerSource().
  constructor(descriptor: DatashaderSourceDescriptor) {
    super(descriptor);
    this._descriptor = descriptor;
  }

  async getImmutableProperties(): Promise<ImmutableSourceProperty[]> {
    return [
      { label: getDataSourceLabel(), value: DatashaderSource.title },
      { label: getUrlLabel(), value: this._descriptor.urlTemplate },
      { label: "Index", value: this._descriptor.indexTitle },
      { label: "Location field", value: this._descriptor.geoField || '' },
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

  getApplyGlobalQuery() {
    return this._descriptor.applyGlobalQuery;
  }

  getApplyGlobalTime() {
    return this._descriptor.applyGlobalTime;
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
      const aggFields: DataViewField[] = [];
      
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

      return aggFields.map((field: DataViewField) => {
        return this.createField({ fieldName: field.name });
      });
    } catch (error) {
      return [];
    }
  }

  async getNumberFields() {
    try {
      const indexPattern = await this.getIndexPattern();
      const numberFields: DataViewField[] = [];
      
      NUMBER_DATA_TYPES.forEach(dataType => {
        indexPattern.fields.getByType(dataType).forEach(field => {
          numberFields.push(field);
        });
      });
      return numberFields.map((field: DataViewField) => {
        return this.createField({ fieldName: field.name });
      });
    } catch (error) {
      return [];
    }
  }

} 

registerSource({
  ConstructorFunction: DatashaderSource,
  type: DatashaderSource.type,
});
