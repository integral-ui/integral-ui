import { Component, Host, h, Element, Prop, Method, Event, EventEmitter, Listen } from '@stencil/core';
import { Sort, Group } from '../utils/utils';

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
  @Event() doSort: EventEmitter<Partial<Sort>>;

  @Method()
  async getConfig() {
    return this;
  }

  doSortHandler(event: MouseEvent) {
    this.doSort.emit({
      key: this.sortKey || this.primaryKey
    })
  }
  
  componentWillLoad() {
    if (!this.primaryKey) {
      throw `Integral UI DataTable column primaryKey is missing`
    }
  }

  render() {
    return (
      <Host>
        <div class="_sort sort_indicator" onClick={e => this.doSortHandler(e)}>
          <svg class="up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M8.71 12.29L11.3 9.7c.39-.39 1.02-.39 1.41 0l2.59 2.59c.63.63.18 1.71-.71 1.71H9.41c-.89 0-1.33-1.08-.7-1.71z"/></svg>
          <svg class="down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"/></svg>
        </div>
        <div>
          <slot></slot>
        </div>
      </Host>
    );
  }

}
