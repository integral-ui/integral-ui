import { Component, Host, h, Prop, State, Element, EventEmitter, Event, Watch, Listen } from '@stencil/core';
import { walkObject, groupBy, paginate, search, sortBy, Sort, Config } from '../utils/utils';

export interface IntDataTableState {
  
}
@Component({
  tag: 'int-data-table',
  styleUrl: 'data-table.css',
  shadow: true,
})
export class DataTable {

  private rowRenderer;
  private columnLayout = '';
  
  @Element() host: Element;

  @State() columns: any[] = [];
  @State() renderedRows = '';
  @State() renderedGroups;
  
  @Prop() data: any[] = [];
  @Prop() config: Config = {};
  @Prop() processData: boolean = true;
  @Prop({ reflect: true }) loading: boolean = true;

  @Event() intDataTableReady: EventEmitter;

  @Watch('data')
  dataChangeHandler() {
    this.updateRows();
  }

  @Watch('config')
  configChangeHandler() {
    this.updateRows();
  }

  @Listen('doSort')
  columnSortEvent(event: CustomEvent) {
    event.stopPropagation()
    const sort: Sort = event.detail;
    sort.direction = 'ASC';
    this.config.sort = [sort];
    this.configChangeHandler();
  }

  componentWillLoad() {
  }

  componentDidLoad() {
    this.constructColumnLayouts();
  }

  constructRowRenderer() {
    const fnBody = `
      return \`${this.columns.map((col, i, arr) => `
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
    this.renderedGroups = '';
    this.renderedRows = '';

    if (this.processData) {
      let processed = this.data;
      if (this.config.sort) {
        processed = sortBy(processed, this.config.sort);
      }
      if (this.config.search) {
        processed = search(processed, null);
      }
      if (this.config.paginate) {
        processed = paginate(processed, this.config.paginate.page, this.config.paginate.length);
      }
      if (this.config.group) {
        processed = groupBy(processed, this.config.group);
        let currentDepth = 0;
        this.renderedGroups = this.flattenGroups(processed, [], 0).map(obj => {
          let strOutput = '';
          const groupStart = `<div class="group"><div class="title">${obj.__groupValue}</div>`;
          const groupEnd = `</div>${groupStart}`;

          if (!obj.__depth) {
            strOutput = `<div class="grid" style="grid-template-columns: ${this.columnLayout}">${obj.map(this.rowRenderer).join('')}</div>`;
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
        });
        this.renderedGroups = this.renderedGroups.join('');
      } else {
        this.renderedRows = this.data.map(this.rowRenderer).join('');
      }
    } else {
      this.renderedRows = this.data.map(this.rowRenderer).join('');
    }
    this.loading = false;
  }

  render() {
    let body;
    let groupTags;
    let groups;
    if (this.renderedGroups) {
      body = <div class="body" innerHTML={this.renderedGroups}></div>;
      groupTags = this.config.group.map(g => `<li>${g.label}<a></a></li>`).join('');
      groups = <ol class="groups" innerHTML={groupTags}></ol>
    } else {
      body = <div class="body grid" style={{ 'grid-template-columns' : this.columnLayout }} innerHTML={this.renderedRows}></div>;
    }
    
    return ( 
      <Host>
        <div class="border">
        {groups}
          <div class="head grid" style={{ 'grid-template-columns' : this.columnLayout, 'padding-left': `${this.config.group ? this.config.group.length * 20 : 0}px`}}>
            <slot></slot>
          </div>
          {body}
        </div>
      </Host>
    );
  }

}
