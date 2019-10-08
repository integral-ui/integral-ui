import { Component, Host, h, EventEmitter, Prop, Event, Element } from '@stencil/core';

@Component({
  tag: 'int-select-item',
  styleUrl: 'int-select-item.css',
  shadow: true
})
export class IntSelectItem {
  _checked = false;
  get checked() {
      return this._checked;
  }
  set checked(value) {
      this._checked = value;
  }
  uiqueID = `int-select-item_${Math.floor(Math.random() * 100000)}`;
  @Prop() value: any;
  @Event() selected: EventEmitter;
  @Element() el: Element;
  clickHandler(e) {
      e.preventDefault();
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
              <input type="checkbox" id={this.uiqueID} /><label htmlFor={this.uiqueID} ><slot/></label>
          </Host>
      )
  }
}
