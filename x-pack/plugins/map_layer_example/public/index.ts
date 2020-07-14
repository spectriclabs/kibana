import { PluginInitializer } from 'kibana/public';
import { CustomLayerPlugin, CustomLayerPluginSetup, CustomLayerPluginStart } from './plugin';

export const plugin: PluginInitializer<CustomLayerPluginSetup, CustomLayerPluginStart> = () => {
  return new CustomLayerPlugin();
};