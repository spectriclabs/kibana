import { i18n } from '@kbn/i18n';

import { AttributionDescriptor } from '../../maps/common/descriptor_types';
import { AbstractSource } from '../../maps/public/classes/sources/source';

import { CustomLayer } from './custom_layer';

export type CustomSourceConfig = AttributionDescriptor & {
};


export class CustomSource /* extends AbstractSource */ {
    static type = 'CUSTOM';

    static title = i18n.translate('xpack.maps.source.customSource', {
        defaultMessage: 'Custom Map Layer',
    });

    static description = i18n.translate('xpack.maps.source.customDescription', {
        defaultMessage: 'Custom Map Layer',
    });

    static icon = 'grid';

    static createDescriptor() {
        return {
            type: CustomSource.type
        };
    }

    constructor(descriptor, inspectorAdapters) {
        /*
        super(
            {
                ...descriptor
            },
            inspectorAdapters
        );
        */
    }

    async getImmutableProperties() {
        return [];
    }

    _createDefaultLayerDescriptor(options) {
        return CustomLayer.createDescriptor({
            sourceDescriptor: this._descriptor,
            ...options,
        });
    }

    createDefaultLayer(options) {
        return new CustomLayer({
            layerDescriptor: this._createDefaultLayerDescriptor(options),
            source: this
        });
    }

    async getDisplayName() {
        return "Custom";
    }

}