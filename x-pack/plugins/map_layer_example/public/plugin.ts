import { Plugin, CoreSetup, CoreStart } from 'src/core/public';

import { MapsPluginSetup, MapsPluginStart } from '../../maps/public/plugin'

import { CustomSource } from './custom_source';
import { customWizardConfig } from './custom_wizard';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomLayerPluginSetupDependencies {
    maps : MapsPluginSetup;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomLayerPluginStartDependencies {
    maps : MapsPluginStart;
}

/**
 * These are the interfaces with your public contracts. You should export these
 * for other plugins to use in _their_ `SetupDeps`/`StartDeps` interfaces.
 * @public
 */
export type CustomLayerPluginSetup = ReturnType<CustomLayerPlugin['setup']>;
export type CustomLayerPluginStart = ReturnType<CustomLayerPlugin['start']>;

/** @internal */
export class CustomLayerPlugin
  implements
    Plugin<
      CustomLayerPluginSetup,
      CustomLayerPluginStart,
      CustomLayerPluginSetupDependencies,
      CustomLayerPluginStartDependencies
    > {
  public setup(core: CoreSetup, plugins: CustomLayerPluginSetupDependencies) {
  }

  public start(core: CoreStart, plugins: any) {
    plugins.maps.registerLayerWizard(
      customWizardConfig
    );
    /*
    plugins.maps.registerSource({
      ConstructorFunction: CustomSource,
      type: CustomSource.type,
    });
    */
  }
}

