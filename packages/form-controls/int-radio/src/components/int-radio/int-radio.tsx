import { Component, Host, h, Listen, Watch, Element, State, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'int-radio',
  styleUrl: 'int-radio.css',
  shadow: true,
})
export class IntRadio {

  
  @Element() host: Element;

  @State() _checked: boolean;
  @State() _disabled: boolean;

  @Prop() name: string;
  @Prop() disabled: boolean = false;
  @Prop({ mutable: true, reflect: true }) value: boolean;
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;

  @Event({
    eventName: 'changed',
    composed: true,
    cancelable: true,
    bubbles: true,
  }) changed: EventEmitter;

  componentWillLoad() {
    this.updateState(this.checked, this.disabled);
  }

  componentDidLoad() {
    this.updateInput(this._checked, this._disabled);
  }

  @Watch('checked')
  watchChecked(newVal:  boolean) {
    this.updateState(newVal, this._disabled);
    this.changed.emit();
  }

  @Watch('disabled')
  watchDisabled(newVal: boolean) {
    this.updateState(this._checked, newVal);
  }

  @Listen('keypress')
  onKeypress(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.updateState(!this._checked, this._disabled);
    }
  }

  @Listen('click')
  onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (this.disabled) {
      return;
    }
    this.updateState(!this._checked, this._disabled);
  }

  updateInput(checked, disabled) {
    const input = this.host.shadowRoot.querySelector('input');
    if (input) {
      input.checked = checked;
      input.disabled = disabled;
    }
  }

  updateState(checked, disabled) {
    this._checked = this.checked = checked;
    this._disabled = this.disabled = disabled;
    this.updateInput(this._checked, this._disabled);
  }
   
  render() {
    return (
      <Host tabindex="0">
        <label>
          <div class="inputWrapper">
            <input type="radio" />
            <div class="box">
              <div class="check"></div>
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
