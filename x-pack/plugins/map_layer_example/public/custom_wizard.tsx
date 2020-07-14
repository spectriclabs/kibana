import { i18n } from '@kbn/i18n';
import React from 'react';

import { LayerWizard, RenderWizardArguments } from '../../maps/public/layers/layer_wizard_registry';

import { CustomSource, CustomSourceConfig } from './custom_source';
import { CustomSourceEditor } from './custom_source_editor';
import { CustomLayer } from './custom_layer';

export const customWizardConfig: LayerWizard = {
  description: i18n.translate('xpack.maps.source.customDescription', {
    defaultMessage: 'Custom layer',
  }),
  icon: 'grid',
  categories: [],
  renderWizard: ({ previewLayer }: RenderWizardArguments) => {
    const onSourceConfigChange = (sourceConfig: CustomSourceConfig) => {
      const layerDescriptor = CustomLayer.createDescriptor({
        sourceDescriptor: CustomSource.createDescriptor(sourceConfig),
      });
      previewLayer(layerDescriptor);
    };

    return <CustomSourceEditor onSourceConfigChange={onSourceConfigChange} />;
  },
  title: CustomSource.title,
};