import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'int-icon',
  taskQueue: 'async',
  devServer: {
    reloadStrategy: 'pageReload'
  },
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
  ]
};
