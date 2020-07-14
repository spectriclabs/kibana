import { AbstractLayer } from '../../maps/public/classes/layers/layer';

export class CustomLayer /* extends AbstractLayer */ {
    static type = "CUSTOM";

    constructor({ layerDescriptor, source, style }) {
        //super({ layerDescriptor, source, style });
    }

    static createDescriptor(options) {
        const annotationsLayerDescriptor = super.createDescriptor(options);
        annotationsLayerDescriptor.type = CustomLayer.type;
        annotationsLayerDescriptor.alpha = _.get(options, 'alpha', 1);
        return annotationsLayerDescriptor;
      }
}