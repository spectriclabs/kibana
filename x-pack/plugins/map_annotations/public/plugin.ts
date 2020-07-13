/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Plugin, CoreSetup, CoreStart } from 'src/core/public';

import { registerSource } from '../../maps/public/layers/sources/source_registry';
import { LayerWizardRegistry } from '../../maps/public/layers/layer_wizard_registry';
import { MapsPluginSetup } from '../../maps/public/plugin'

import { AnnotationsSource } from './annotations_source';
import { annotationsWizardConfig } from './annotations_wizard';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AnnotationsPluginSetupDependencies {
    maps : MapsPluginSetup;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AnnotationsPluginStartDependencies {}

export const bindSetupCoreAndPlugins = (core: CoreSetup, plugins: any) => {
    console.log("WTF 1");
};

export const bindStartCoreAndPlugins = (core: CoreStart, plugins: any) => {
    console.log("WTF 2");
};

/**
 * These are the interfaces with your public contracts. You should export these
 * for other plugins to use in _their_ `SetupDeps`/`StartDeps` interfaces.
 * @public
 */
export type AnnotationsPluginSetup = ReturnType<AnnotationsPlugin['setup']>;
export type AnnotationsPluginStart = ReturnType<AnnotationsPlugin['start']>;

/** @internal */
export class AnnotationsPlugin
  implements
    Plugin<
      AnnotationsPluginSetup,
      AnnotationsPluginStart,
      AnnotationsPluginSetupDependencies,
      AnnotationsPluginStartDependencies
    > {
  public setup(core: CoreSetup, plugins: AnnotationsPluginSetupDependencies) {
    bindSetupCoreAndPlugins(core, plugins);
    console.log("Done");
  }

  public start(core: CoreStart, plugins: any) {
    bindStartCoreAndPlugins(core, plugins);

    plugins.maps.registerLayerWizard(annotationsWizardConfig);

    plugins.maps.registerSource({
      ConstructorFunction: AnnotationsSource,
      type: AnnotationsSource.type,
    });

  }
}


