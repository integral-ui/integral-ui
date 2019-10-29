import { 
  Component,
  Host,
  h,
  Element,
  Listen,
  Prop,
  EventEmitter,
  Event
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
  @Prop() checked: boolean = false;
  @Prop() indeterminate: boolean = false;
  @Prop() disabled: boolean = false;

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
    this.checkbox.checked = this.checked;
    this.checkbox.disabled = this.disabled;
    this.checkbox.indeterminate = this.indeterminate;
  }
  // componentWillUpdate() {}
  // componentDidUpdate() {}
  // componentDidUnload() {}

  /**
   * Listeners
   */
  @Listen('click')
  onClick(_: UIEvent) {
    let changed = this.checked != this.checkbox.checked || this.disabled != this.checkbox.disabled || this.indeterminate != this.checkbox.indeterminate;

    this.checked = this.checkbox.checked;
    this.disabled = this.checkbox.disabled;
    this.indeterminate = this.checkbox.indeterminate;

    if (changed) {
      this.changed.emit();
    }
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
