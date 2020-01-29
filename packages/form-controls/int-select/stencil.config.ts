import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'int-select',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ],
  devServer: {
    reloadStrategy: 'pageReload'
  }
};
