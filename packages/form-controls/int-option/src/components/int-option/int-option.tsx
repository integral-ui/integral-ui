import { Component, Host, h, Watch, Prop, Element, Event, State, EventEmitter, Listen, Method } from '@stencil/core';

@Component({
  tag: 'int-option',
  styleUrl: 'int-option.css',
  shadow: true,
})
export class IntOption {

  @Element() host: Element;

  @State() _checked: boolean;
  @State() _indeterminate: boolean;
  @State() _disabled: boolean;

  @Prop() name: string;
  @Prop() disabled: boolean = false;
  @Prop({ mutable: true, reflect: true }) value: boolean;
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;
  @Prop({ mutable: true, reflect: true }) indeterminate: boolean = false;

  @Event({
    eventName: 'changed',
    composed: true,
    cancelable: true,
    bubbles: true,
  }) changed: EventEmitter;

  componentWillLoad() {
    this.updateState(this.checked, this.indeterminate, this.disabled);
  }

  componentDidLoad() {
    this.updateInput(this._checked, this._indeterminate, this._disabled);
  }

  @Watch('checked')
  watchChecked(newVal:  boolean) {
    this.updateState(newVal, this._indeterminate, this._disabled);
    this.changed.emit();
  }

  @Watch('indeterminate')
  watchIndeterminate(newVal: boolean) {
    this.updateState(this._checked, newVal, this._disabled);
  }

  @Watch('disabled')
  watchDisabled(newVal: boolean) {
    this.updateState(this._checked, this._indeterminate, newVal);
  }

  @Listen('keypress')
  onKeypress(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.updateState(!this._checked, this._indeterminate, this._disabled);
    }
  }

  @Listen('click')
  onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (this.disabled) {
      return;
    }
    this.updateState(!this._checked, this._indeterminate, this._disabled);
  }

  updateInput(checked, indeterminate, disabled) {
    const input = this.host.shadowRoot.querySelector('input');
    if (input) {
      input.checked = checked;
      input.indeterminate = indeterminate;
      input.disabled = disabled;
    }
  }

  updateState(checked, indeterminate, disabled) {
    if (checked !== this.checked) {
      indeterminate = false;
    }
    this._checked = this.checked = checked;
    this._indeterminate = this.indeterminate = indeterminate;
    this._disabled = this.disabled = disabled;
    this.updateInput(this._checked, this._indeterminate, this._disabled);
  }
   
  render() {
    return (
      <Host tabindex="0">
        <label>
          <div class="inputWrapper">
            <input type="checkbox" />
            <div class="box">
                <svg class="check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 21.035l-9-8.638 2.791-2.87 6.156 5.874 12.21-12.436 2.843 2.817z"/></svg>
                <svg class="line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.4 10.1h13v3h-13z"/></svg>
            </div>
          </div>
          <span class={this.disabled ? "disabled" : ""}>
            <slot></slot>
          </span>
        </label>
      </Host>
    );
  }

}
