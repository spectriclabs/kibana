import { i18n } from '@kbn/i18n';
import React from 'react';

import { LayerWizard, RenderWizardArguments } from '../../maps/public/layers/layer_wizard_registry';

import { AnnotationsSource, AnnotationsSourceConfig } from './annotations_source';
import { AnnotationsEditor } from './annotations_source_editor';
import { AnnotationsLayer } from './annotations_layer';

export const annotationsWizardConfig: LayerWizard = {
  description: i18n.translate('xpack.maps.source.annotationsDescription', {
    defaultMessage: 'Annotations layer',
  }),
  icon: 'grid',
  renderWizard: ({ previewLayer }: RenderWizardArguments) => {
    const onSourceConfigChange = (sourceConfig: AnnotationsSourceConfig) => {
      const layerDescriptor = AnnotationsLayer.createDescriptor({
        sourceDescriptor: AnnotationsSource.createDescriptor(sourceConfig),
      });
      previewLayer(layerDescriptor);
    };

    return <AnnotationsEditor onSourceConfigChange={onSourceConfigChange} />;
  },
  title: AnnotationsSource.title,
};