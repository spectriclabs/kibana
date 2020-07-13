import { i18n } from '@kbn/i18n';
import { registerSource } from '../../maps/public/layers/sources/source_registry';

import { AttributionDescriptor } from '../../maps/common/descriptor_types';
import { AbstractSource, Attribution, ISource } from '../../maps/public/layers/sources/source';

import { AnnotationsLayer } from './annotations_layer';

export type AnnotationsSourceConfig = AttributionDescriptor & {
};

console.log("loading src");

export class AnnotationsSource extends AbstractSource {
    static type = 'ANNOTATIONS';

    static title = i18n.translate('xpack.maps.source.annotationsSource', {
        defaultMessage: 'Annotations Map Layer',
    });

    static description = i18n.translate('xpack.maps.source.annotationsDescription', {
        defaultMessage: 'Annotations Map Layer',
    });

    static icon = 'grid';

    static createDescriptor() {
        return {
            type: AnnotationsSource.type
        };
    }

    constructor(descriptor, inspectorAdapters) {
        super(
            {
                ...descriptor
            },
            inspectorAdapters
        );
    }

    async getImmutableProperties() {
        return [];
    }

    _createDefaultLayerDescriptor(options) {
        return AnnotationsLayer.createDescriptor({
            sourceDescriptor: this._descriptor,
            ...options,
        });
    }

    createDefaultLayer(options) {
        return new AnnotationsLayer({
            layerDescriptor: this._createDefaultLayerDescriptor(options),
            source: this
        });
    }

    async getDisplayName() {
        return "Annotations";
    }

}

registerSource({
    ConstructorFunction: AnnotationsSource,
    type: AnnotationsSource.type,
});


