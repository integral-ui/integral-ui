import { 
  Component,
  Host,
  h,
  Element,
  Listen,
  Prop,
  EventEmitter,
  Event,
  Watch
} from '@stencil/core';

@Component({
  tag: 'int-checkbox',
  styleUrl: 'int-checkbox.css',
  shadow: true
})
export class IntCheckbox {
  /**
   * Own Properties
   */

  /**
   * Reference to host HTML element.
   */
  @Element() el: HTMLElement;
  checkbox: HTMLInputElement;

  /**
   * State() variables
   */

  /**
   * Public Property API
   */
  @Prop({ mutable: true, reflect: true }) name: string;
  @Prop({ mutable: true, reflect: true }) value: boolean;
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;
  @Prop({ mutable: true, reflect: true }) indeterminate: boolean = false;
  @Prop({ mutable: true, reflect: true }) disabled: boolean = false;

  /**
   * Events section
   */
  @Event({
    eventName: 'changed',
    composed: true,
    cancelable: true,
    bubbles: true,
  }) changed: EventEmitter;

  /**
   * Component lifecycle events
   */
  // componentWillLoad() {}
  componentDidLoad() {
    this.checkbox.indeterminate = this.indeterminate;
    if (this.indeterminate) {
      this.checkbox.checked = false;
      this.checked = false;

    } else {
      this.checkbox.checked = this.checked;      
    }
    this.checkbox.disabled = this.disabled;
  }
  // componentWillUpdate() {}
  // componentDidUpdate() {}
  // componentDidUnload() {}

  /**
   * Listeners
   */
  @Watch('checked')
  watchChecked(newVal:  boolean, _: boolean) {
    this.checkbox.checked = newVal;
    if (!this.indeterminate) {
      this.changed.emit();
    }

    this.value = this.checkbox.checked;
  }

  @Watch('indeterminate')
  watchIndeterminate(newVal:  boolean, _: boolean) {
    this.checkbox.indeterminate = newVal;
    this.checkbox.checked = false;
    this.checked = false;
    if (!(this.checked  && !this.indeterminate)) {
      this.changed.emit();
    }
  }

  @Watch('disabled')
  watchDisabled(newVal: boolean) {
    this.checkbox.disabled = newVal;
  }

  @Listen('click')
  onClick() {
    this.checked = this.indeterminate ? false : this.checkbox.checked;
    this.indeterminate = this.checkbox.indeterminate;
    this.disabled = this.checkbox.disabled;
  }
   
  /**
   * Public methods API
   */

  /**
   * Local methods
   */

  /**
   * render() function
   */
  render() {
    return (
      <Host>
        <label>
          <input ref={(el) => { this.checkbox = el }} type="checkbox"></input>
          <slot></slot>
        </label>
      </Host>
    );
  }
}
