import { Component, Host, h, EventEmitter, Prop, Event, Element, State } from '@stencil/core';

@Component({
  tag: 'int-select-item',
  styleUrl: 'int-select-item.css',
  shadow: true
})
export class IntSelectItem {
  @State() checked: boolean;
  @Prop() value: any;
  @Event() selected: EventEmitter;
  @Element() el: Element;
  clickHandler(e) {
      e.preventDefault();
      e.stopPropagation();
      this.checked = !this.checked;
      this.setValue(this.checked);
  }
  setValue(value) {
      this.checked = value;
      this.el.shadowRoot.querySelector('input').checked = this.checked;
      this.selected.emit({value: this.value, checked: this.checked});
  }
  render() {
      return (
          <Host onClick={(event) => this.clickHandler(event)}>
              <slot/>
          </Host>
      )
  }
}
