import { AbstractLayer } from '../../maps/public/layers/layer';

export class AnnotationsLayer extends AbstractLayer {
    static type = "ANNOTATIONS";

    constructor({ layerDescriptor, source, style }) {
        super({ layerDescriptor, source, style });
    }

    static createDescriptor(options) {
        const annotationsLayerDescriptor = super.createDescriptor(options);
        annotationsLayerDescriptor.type = AnnotationsLayer.type;
        annotationsLayerDescriptor.alpha = _.get(options, 'alpha', 1);
        return annotationsLayerDescriptor;
      }
}