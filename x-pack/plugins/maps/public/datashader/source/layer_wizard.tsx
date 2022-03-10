/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import React from 'react';
import { DatashaderSource } from './datashader_source';
import { DatashaderSourceEditor, DatashaderSourceConfig } from './datashader_source_editor';
import { LayerWizard, RenderWizardArguments } from '../../classes/layers/layer_wizard_registry';
import { DatashaderLayer } from '../layer/datashader_layer';
import { getDatashader } from '../../kibana_services';

export const datashaderWizardConfig: LayerWizard = {
  categories: [],
  description: i18n.translate('xpack.maps.source.datashaderDescription', {
    defaultMessage: 'Datashader layer',
  }),
  icon: 'grid',
  prerequisiteSteps: [],
  renderWizard: ({ previewLayers }: RenderWizardArguments) => {
    const onSourceConfigChange = (sourceConfig: DatashaderSourceConfig | null) => {
      if (!sourceConfig) {
        previewLayers([]);
        return;
      }

      const layerDescriptor = DatashaderLayer.createDescriptor({
        sourceDescriptor: DatashaderSource.createDescriptor(sourceConfig),
      });

      previewLayers( [layerDescriptor] );
    };

    const settings = getDatashader();

    return <DatashaderSourceEditor settings={settings} onSourceConfigChange={onSourceConfigChange} />;
  },
  title: DatashaderSource.title,
};
