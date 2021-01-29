# data-table-column



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type      | Default                                                            |
| ------------ | ------------- | ----------- | --------- | ------------------------------------------------------------------ |
| `filterKey`  | `filter-key`  |             | `string`  | `undefined`                                                        |
| `primaryKey` | `primary-key` |             | `string`  | `undefined`                                                        |
| `renderer`   | `renderer`    |             | `string`  | ``(row, index, column, walker) => walker(row, column.primaryKey)`` |
| `sortKey`    | `sort-key`    |             | `string`  | `undefined`                                                        |
| `trim`       | `trim`        |             | `boolean` | `true`                                                             |
| `width`      | `width`       |             | `string`  | `'minmax(0, 1fr)'`                                                 |


## Events

| Event    | Description | Type                                                          |
| -------- | ----------- | ------------------------------------------------------------- |
| `doSort` |             | `CustomEvent<{ key?: string; direction?: "ASC" \| "DESC"; }>` |


## Methods

### `getConfig() => Promise<this>`



#### Returns

Type: `Promise<this>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
