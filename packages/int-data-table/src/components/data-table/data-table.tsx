import { Component, Host, h, Prop, State, Element, EventEmitter, Event, Watch, Listen } from '@stencil/core';
import { walkObject, groupBy, paginate, search, sortBy, Sort, Config, Group, DataTableConfig } from '../utils/utils';

class DataGridRow {
  index = 0;
  data;
  constructor(record, index) {
    this.data = record;
    this.index = index;
  }
}

@Component({
  tag: 'int-data-table',
  styleUrl: 'data-table.css',
  shadow: true,
})
export class DataTable {

  private _config: Config = new DataTableConfig();
  private rowRenderer;
  private columnLayout = '';
  private bodyEl: HTMLDivElement;
  private rowCache = [];
  private virtualizedRowTracker: [start:number, end:number] = [0,0];
  
  @Element() host: Element;

  @State() columns: any[] = [];
  @State() renderedContent = '';
  
  @Prop() data: any[] = [];
  @Prop() rowHeight: number = 26;
  @Prop() processData: boolean = true;
  @Prop({ mutable: true }) config: Config = new DataTableConfig();
  @Prop({ reflect: true }) loading: boolean = true;
  @Prop({ reflect: true }) dragColumnToGroup: boolean = true;

  @Event() intDataTableReady: EventEmitter;

  @Watch('data')
  dataChangeHandler() {
    this.dataChanged()
  }

  @Watch('config')
  configChangeHandler(newValue) {
    this.updateConfig(newValue);
    this.updateRows();
  }

  @Listen('doSort')
  columnSortEvent(event: CustomEvent) {
    event.stopPropagation()
    this.updateConfig({
      sort: [{
        key: event.detail.key,
        direction: 'ASC'
      }]
    })
  }

  viewportWatcher() {
    this.updateVirtualRows();
    this.renderVirtualRows();
  }

  updateVirtualRows() {
    const viewport = this.bodyEl; //((this as unknown) as HTMLDivElement);
    const startIndex = viewport.scrollTop/this.rowHeight;
    const visibleRows = viewport.clientHeight/this.rowHeight;
    const endIndex = startIndex + visibleRows;
    this.virtualizedRowTracker = [Math.floor(startIndex), Math.ceil(endIndex)]
  }
  
  removeGroupEvent(event: MouseEvent) {
    event.stopPropagation()
    const el = event.target as HTMLAnchorElement; //https://palantir.github.io/tslint/rules/no-angle-bracket-type-assertion/
    this.removeGroup(el.dataset.key);
  }

  removeGroup(key: string) {
    this.updateConfig({
      group: this._config.group.filter((g: Group) => g.key !== key)
    })
  }

  updateConfig(change: Config) {
    this._config = new DataTableConfig(Object.assign({}, this._config, change));
    this.config = this._config;
  }

  getConfig() {
    return this._config;
  }

  dataChanged() {
    this.updateRows();
  }

  componentWillLoad() {
  }

  componentDidLoad() {
    this.bodyEl = this.host.shadowRoot.querySelector('._body');
    this.constructColumnLayouts();
    this.updateVirtualRows()
  }

  constructRowRenderer() {
    const fnBody = `
      return \`${this.columns.map((col, i, arr) => `
        <div class="cell ${ col.trim ? 'trim' : '' }" data-row-index="\${index}" \${index % 2 ? 'data-row-stripe' : ''}  data-col-index="${i}" ${i === 0 ? 'data-row-start' : ''} ${i === arr.length - 1 ? 'data-row-end' : ''}
        >\${(${col.renderer})(row, index, columns[${i}], walker)}</div>
      `).join('\n')}\`
    `;
    const renderFn = new Function('row','index','columns','walker',fnBody);
    this.rowRenderer = (rowInstance) => {
      return renderFn(rowInstance.data, rowInstance.index, this.columns, walkObject);
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
      accumulator.push({ __groupLabel: tree.__groupLabel, __groupValue: tree.__groupValue, __depth: depth});
    }
    if (tree.__rows) {
      accumulator.push(tree.__rows);
    } else {
      const subLevels = Object.getOwnPropertyNames(tree).filter(l => l !== '__groupLabel' && l !== '__groupKey' && l !== '__groupValue');
      depth++
      subLevels.forEach(level => this.flattenGroups(tree[level], accumulator, depth));
    }
    if (tree.__groupLabel === undefined) {
      return accumulator;
    }
  }

  updateRows() {
    let processed = this.data;
    if (this.processData) {
      if (this._config.sort.length) {
        processed = sortBy(processed, this._config.sort);
      }
      if (this._config.search) {
        processed = search(processed, null);
      }
      if (this._config.paginate) {
        processed = paginate(processed, this._config.paginate.page, this._config.paginate.length);
      }
      if (this._config.group.length) {
        processed = groupBy(processed, this._config.group);
        let currentDepth = 0;
        this.renderedContent = this.flattenGroups(processed, [], 0).map(obj => {
          let strOutput = '';
          const groupStart = `<div class="group"><div class="title">${obj.__groupValue}</div>`;
          const groupEnd = `</div>${groupStart}`;

          if (!obj.__depth) {
            strOutput = `<div class="grid" style="grid-template-columns: ${this.columnLayout}">${obj.map((row, i) => new DataGridRow(row, i)).map(this.rowRenderer).join('')}</div>`;
          } else if (obj.__depth > currentDepth) {
            strOutput = groupStart;
            currentDepth = obj.__depth;
          } else if (obj.__depth < currentDepth) {
            strOutput = `${ new Array(currentDepth - obj.__depth).fill('</div>').join('') }${groupEnd}`;
            currentDepth = obj.__depth;
          } else if (obj.__depth === currentDepth) {
            strOutput = groupEnd;
          }

          return strOutput;
        }).join('');
      } else {
        this.rowCache = processed.map((row, i) => new DataGridRow(row, i));
        this.renderVirtualRows();
      }
    } else {
      this.renderedContent = processed.map((row, i) => new DataGridRow(row, i)).map(this.rowRenderer).join('');
    }
    this.loading = false;
  }

  renderVirtualRows() {
    const padding = 50;
    const [vStart, vEnd] = this.virtualizedRowTracker;
    const startIndex = (vStart - padding > 0) ? vStart - padding : 0;
    const endIndex = (vEnd + padding < this.rowCache.length) ? vEnd + padding : vEnd;

    const preViewSpacer = `<div style="grid-column:span ${this.columns.length};height:${startIndex * this.rowHeight}px;"></div>`;
    const postViewSpacer = `<div style="grid-column:span ${this.columns.length};height:${(this.rowCache.length - endIndex) * this.rowHeight}px;"></div>`;
    this.renderedContent = [preViewSpacer, ...this.rowCache.slice(startIndex, endIndex).map(this.rowRenderer), postViewSpacer].join('');
  }

  render() {
    let bodyStyle = {};
    let bodyClass = '_body body';
    let groups;

    if (this.dragColumnToGroup) {
      groups = <ol class="groups">
        Drag columns to group:
        {this._config.group.map( g => 
          <li key={g.key}>
            <span>{g.label}</span>
            <a onClick={(e) => this.removeGroupEvent(e)} data-key={g.key}></a>
          </li>
        )}
      </ol>;
    }
    if (this._config.group.length === 0) {
      bodyStyle = { 'grid-template-columns' : this.columnLayout };
      bodyClass += ' grid';
    }
    
    return ( 
      <Host>
        {this.virtualizedRowTracker}
        <div class="border">
          {groups}
          <div class="head grid" style={{ 'grid-template-columns' : this.columnLayout, 'padding-left': `${this._config.group ? this._config.group.length * 20 : 0}px`}}>
            <slot></slot>
          </div>
          <div onScroll={() => this.viewportWatcher()} class={bodyClass} style={bodyStyle} innerHTML={this.renderedContent}></div>
        </div>
      </Host>
    );
  }

}
