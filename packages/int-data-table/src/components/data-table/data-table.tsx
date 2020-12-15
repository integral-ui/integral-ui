import { Component, Host, h, Prop, State, Element, EventEmitter, Event, Watch } from '@stencil/core';
import { walkObject, groupBy, paginate, search, sortBy } from '../utils/utils';

@Component({
  tag: 'int-data-table',
  styleUrl: 'data-table.css',
  shadow: true,
})
export class DataTable {

  private rowRenderer;
  private recursiveAggregator = [];
  private columnLayout = '';
  
  @Element() host: Element;

  @State() columns: any[] = [];
  @State() renderedRows = '';
  
  @Prop() data: any[] = [];
  @Prop() config: any = {};
  @Prop() processData: boolean = true;
  @Prop({ reflect: true }) loading: boolean = true;

  @Event() intDataTableReady: EventEmitter;

  @Watch('data')
  dataChangeHandler() {
    this.updateRows()
  }

  @Watch('config')
  configChangeHandler() {
    // change to columns OR search/sort/filter/pagination
  }

  componentWillLoad() {
  }

  componentDidLoad() {
    this.constructColumnLayouts();
  }

  constructRowRenderer() {
    const fnBody = `
      return row.__group ?
        \`<div style="grid-column-end:span \${columns.length};" class="group level\${row.__depth}">\${row.__group}</div>\` :
        \`${this.columns.map((col, i, arr) => `
            <div class="cell ${ col.trim ? 'trim' : '' }" data-row-index="\${index}" \${index % 2 ? 'data-row-stripe' : ''}  data-col-index="${i}" ${i === 0 ? 'data-row-start' : ''} ${i === arr.length - 1 ? 'data-row-end' : ''}
          >\${(${col.renderer})(row, index, columns[${i}], walker)}</div>
      `).join('\n')}\`
    `;
    const renderFn = new Function('row','index','columns','walker',fnBody);
    this.rowRenderer = (row, index) => {
      return renderFn(row, index, this.columns, walkObject);
    };
    this.intDataTableReady.emit();
  }

  async constructColumnLayouts() {
    const elements = Array.from(this.host.querySelectorAll("int-data-table-column"));
    this.columns = await Promise.all(elements.map(el => el.getConfig()))
    this.columnLayout = `${this.columns.map(c => c.width).join(' ')}`
    this.constructRowRenderer();
  }

  flattenGroups(tree, accumulator, depth: number) {
    if (tree.__groupLabel) {
      accumulator.push({ __group: tree.__groupLabel, __depth: depth});
    }
    if (tree.__rows) {
      accumulator.push(tree.__rows);
    } else {
      const subLevels = Object.getOwnPropertyNames(tree).filter(l => l !== '__groupLabel' && l !== '__groupKey');
      depth++
      subLevels.forEach(level => this.flattenGroups(tree[level], accumulator, depth));
    }
    if (tree.__groupLabel === undefined) {
      return accumulator;
    }
  }

  updateRows() {
    if (this.processData) {
      let processed = this.data;
      processed = sortBy(processed, [{key: 'name.first',direction: 'ASC'}]);
      processed = paginate(processed, 1, 200);
      processed = groupBy(processed, [{key: 'isActive', label: 'Active Status'}, {key: 'name.salutation', label: 'Title'}, {key: 'faults.0', label: 'Fault'}]);
      this.renderedRows = this.flattenGroups(processed, [], 0).flat().map(this.rowRenderer).join('');
    } else {
      this.renderedRows = this.data.map(this.rowRenderer).join('');
    }
    this.loading = false; 
  }

  render() {
    return ( 
      <Host>
        <div class="border">
          <div class="head grid" style={{ 'grid-template-columns' : this.columnLayout}}>
            <slot></slot>
          </div>
          <div class="body grid" style={{ 'grid-template-columns' : this.columnLayout }} innerHTML={this.renderedRows}></div>
        </div>
      </Host>
    );
  }

}
