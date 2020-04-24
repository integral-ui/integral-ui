import { Component, ComponentInterface, Host, h, Prop, State, Element, Watch } from '@stencil/core';
import { getGlobalReference, setGlobalReference } from '../../utils/utils';

@Component({
  tag: 'int-icon',
  styleUrl: 'int-icon.css',
  shadow: true,
})
export class IntIcon implements ComponentInterface {

  private _svg = '';
  private _cache;
  private set cache(value: Promise<string | void>) {
    this._cache = getGlobalReference('iconCache') || {};
    this._cache[this.url] = value;
    setGlobalReference('iconCache', this._cache);
  }
  private get cache(): Promise<string | void> {
    const cacheRef = getGlobalReference('iconCache');
    if (cacheRef){
      return cacheRef[this.url];
    } else {
      return undefined;
    }
  }

  @Element() host: Element;

  @State() _style = {};

  /**
   * URL to load SVG file into icon
   */
  @Prop() url: string;

  componentDidLoad() {
    this.fetchIcon()
  }
  
  setSvg(svg) {
    const content = encodeURIComponent(svg.replace(/\n/g, ''));
    this._svg = content;
    this.setStyle();
  }

  setStyle() {
    const style = {
      WebkitMaskImage: `url("data:image/svg+xml,${this._svg}")`,
      maskImage: `url("data:image/svg+xml,${this._svg}")`
    }
    this._style = style;
  }  

  @Watch('url')
  async fetchIcon() {
    if (!this.cache) {
      this.cache = fetch(this.url).then(resp => resp.text()).then(svg => {
        this.setSvg(svg);
        return svg;
      });
    } else {
      this.cache.then(svg => {
        this.setSvg(svg)
      });
    }
  }

  render() {
    return (
      <Host>
        <span style={ this._style }></span>
      </Host>
    );
  }

}
