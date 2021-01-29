import { Component, Host, h, Prop, State, Element, EventEmitter, Event, Watch, Listen } from '@stencil/core';
import { walkObject, groupBy, paginate, search, sortBy, Config, Group, DataTableConfig } from '../utils/utils';

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
  private previousRowBounds: [start:number, end:number] = [0,0];
  private visibleRowBounds: [start:number, end:number] = [0,0];
  private visibleRowBuffer = 50;
  private rowBorderSize = 1;
  // private colBorderSize = 1;

  @Element() host: Element;

  @State() columns: any[] = [];
  @State() renderedContent;

  @Prop() data: any[] = [];
  @Prop() rowHeight: number;
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
    const delta = Math.abs(this.previousRowBounds[0] - this.visibleRowBounds[0]);
    const threshold = this.visibleRowBuffer / 2;
    console.log(`%cScrollTop & ScrollHeight`, "color: grey;", this.bodyEl.scrollTop, this.bodyEl.scrollHeight)
    if (delta > threshold) {
      console.log(`%cupdate triggered`, "color: red; font-weight:bold;", this.visibleRowBounds)
      console.log(`%cScrollTop & ScrollHeight`, "color: blue; font-weight:bold;", this.bodyEl.scrollTop, this.bodyEl.scrollHeight)
      this.previousRowBounds = [...this.visibleRowBounds];
      this.renderVirtualRows();
    }
  }

  updateVirtualRows() {
    const trueRowSize = this.rowHeight + this.rowBorderSize;
    const viewport = this.bodyEl;
    const startIndex = viewport.scrollTop/trueRowSize;
    const visibleRows = viewport.clientHeight/trueRowSize;
    const endIndex = startIndex + visibleRows;
    this.visibleRowBounds = [Math.floor(startIndex), Math.ceil(endIndex)]
  }

  renderVirtualRows() {
    const height = this.rowHeight + this.rowBorderSize;
    const rows = this.rowCache;
    const rowCount = rows.length;

    const padding = this.visibleRowBuffer;
    const [vStart, vEnd] = this.visibleRowBounds;
    const startIndex = (vStart - padding > 0) ? vStart - padding : 0;
    const endIndex = (vEnd + padding < rowCount) ? vEnd + padding : rowCount;
    const preSpacer = (startIndex === 0) ? null : <div key="pre_spacer" class="full-width virtual-scroll-spacer top-spacer" style={{'height': `${startIndex * height}px`}}></div>;
    const postSpacer = (endIndex === rowCount) ? null : <div key="post_spacer" class="full-width virtual-scroll-spacer bottom-spacer" style={{'height': `${(rowCount - endIndex) * height}px`}}></div>;
    this.renderedContent = [preSpacer, ...rows.slice(startIndex, endIndex).map(this.rowRenderer), postSpacer];
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
    this.updateRows()
  }

  getConfig(): Config {
    return this._config;
  }

  dataChanged() {
    this.updateRows();
  }

  componentWillLoad() {
  }

  componentDidLoad() {
    this.bodyEl = this.host.shadowRoot.querySelector('[data-render-output]');
    // this.rowBorderSize = parseInt(getComputedStyle(this.host).getPropertyValue("--int-border-width"));
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
    const emptyFnBody = `
      return \`${this.columns.map((col, i, arr) => `
        <div class="cell ${ col.trim ? 'trim' : '' }" data-row-index="\${index}" \${index % 2 ? 'data-row-stripe' : ''}  data-col-index="${i}" ${i === 0 ? 'data-row-start' : ''} ${i === arr.length - 1 ? 'data-row-end' : ''}></div>
      `).join('\n')}\`
    `;
    const renderFn = new Function('row','index','columns','walker',fnBody);
    const emptyRenderFn = new Function('row','index','columns','walker',emptyFnBody);
    this.rowRenderer = (rowInstance) => {
      try {
        return <div key={rowInstance.index} class="row" innerHTML={renderFn(rowInstance.data, rowInstance.index, this.columns, walkObject)}></div>
      } catch (e) {
        console.error(e)
        return <div key={rowInstance.index} class="row" innerHTML={emptyRenderFn(rowInstance.data, rowInstance.index, this.columns, walkObject)}></div>
      }
      // return <div key={rowInstance.index} class="row" innerHTML={renderFn(rowInstance.data, rowInstance.index, this.columns, walkObject)}></div>
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

  render() {
    let bodyStyle = {};
    let bodyClass = { 'body': true, 'grid': false };
    const showGroups = this.getConfig().group.length > 0;
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

    if (!showGroups) {
      bodyStyle = {
        'grid-template-columns' : this.columnLayout,
        'grid-auto-rows': `${this.rowHeight}px`
      };
      bodyClass.grid = true
    }

    return (
      <Host>
        <div class="border">
          {groups}
          <div class="head grid" style={{ 'grid-template-columns' : this.columnLayout, 'padding-left': `${this._config.group ? this._config.group.length * 20 : 0}px`}}>
            <slot></slot>
          </div>
          <div data-render-output data-paint-container onScroll={() => this.viewportWatcher()} class={bodyClass} style={bodyStyle}>
            {this.renderedContent}
          </div>
        </div>
      </Host>
    );
  }

}
