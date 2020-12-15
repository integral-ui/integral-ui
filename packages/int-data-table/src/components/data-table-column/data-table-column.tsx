import { Component, Host, h, Element, Prop, Method } from '@stencil/core';

@Component({
  tag: 'int-data-table-column',
  styleUrl: 'data-table-column.css',
  shadow: true,
})
export class DataTableColumn {

  @Element() host: Element;
  @Prop() primaryKey: string;
  @Prop() sortKey: string;
  @Prop() filterKey: string;
  @Prop() width: string = 'minmax(0, 1fr)';
  @Prop() renderer: string = `(row, index, column, walker) => walker(row, column.primaryKey)`;
  @Prop() trim: boolean = true;

  @Method()
  async getConfig() {
    return this;
  }

  componentWillLoad() {
    if (!this.primaryKey) {
      throw `Integral UI DataTable column primaryKey is missing`
    }
  }

  render() {
    return (
      <Host>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"> <path d="M18.36,9.29c.39.39.26.71-.29.71H5.93c-.55,0-.68-.32-.29-.71l5.65-5.65a1,1,0,0,1,1.42,0Z" /> <path d="M5.64,13.71c-.39-.39-.26-.71.29-.71H18.07c.55,0,.68.32.29.71l-5.65,5.65a1,1,0,0,1-1.42,0Z" /></svg>
        <div>
          <slot></slot>
        </div>
      </Host>
    );
  }

}
