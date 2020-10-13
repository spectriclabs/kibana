/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import React from 'react';
import { DatashaderSource, DatashaderEditor, DatashaderSourceConfig } from './sources/datashader_source';
import { LayerWizard, RenderWizardArguments } from '../../../maps/public/layers/layer_wizard_registry';
import { DatashaderLayer } from './datashader_layer';
import { getInjectedVarFunc } from '../../../maps/public/kibana_services';

function getDatashaderLayerSettings() {
  const getInjectedVar = getInjectedVarFunc();
  if (getInjectedVar) {
    return getInjectedVar('datashader');
  } else {
    return null;
  }
}

export const datashaderWizardConfig: LayerWizard = {
  description: i18n.translate('xpack.maps.source.datashaderDescription', {
    defaultMessage: 'Datashader layer',
  }),
  icon: 'grid',
  renderWizard: ({ previewLayer }: RenderWizardArguments) => {
    const onSourceConfigChange = (sourceConfig: DatashaderSourceConfig) => {
      const layerDescriptor = DatashaderLayer.createDescriptor({
        sourceDescriptor: DatashaderSource.createDescriptor(sourceConfig),
      });
      previewLayer(layerDescriptor);
    };

    const settings = getDatashaderLayerSettings();

    return <DatashaderEditor settings={settings} onSourceConfigChange={onSourceConfigChange} />;
  },
  title: DatashaderSource.title,
};
