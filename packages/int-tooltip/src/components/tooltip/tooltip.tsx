import { Component, Host, h, Prop, State, Listen, Element, EventEmitter, Event } from '@stencil/core';
import "@integral-ui/int-overlay";

@Component({
  tag: 'int-tooltip',
  styleUrl: 'tooltip.css',
  shadow: true
})
export class Tooltip {

  private overlay: HTMLIntOverlayElement;

  @Element()
  host: Element;

  @Prop()
  selector: string = '[data-int-tooltip]';

  @Prop()
  offsetX: number = 12;

  @Prop()
  offsetY: number = 12;

  @Prop()
  content: string;

  @State()
  displayTooltip: boolean = false;

  @Event()
  showTooltip: EventEmitter;

  @Event()
  hideTooltip: EventEmitter;

  @Listen('mousemove', { target: 'document' })
  trackPosition(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.matches(this.selector)) {
      if (!this.isEnabled()) {
        this.setContent(target);
        this.enable();
      }
      this.follow(event.clientX, event.clientY);
    } else {
      this.disable();
    }

  }

  componentDidLoad() {
    this.overlay = this.host.shadowRoot.querySelector("int-overlay");
  }

  setContent(target) {
    const content = target.dataset.intTooltip;
    if (content) {
      this.overlay.innerText = content;
    } else {
      this.overlay.innerHTML = this.host.innerHTML;
    }
  }

  enable() {
    this.displayTooltip = true;
  }

  disable() {
    this.displayTooltip = false;
  }

  isEnabled() {
    return this.displayTooltip;
  }

  follow(x: number, y: number) {
    if (this.isEnabled()) {
      this.overlay.x = x + this.offsetX;
      this.overlay.y = y + this.offsetY;
    }
  }

  render() {
    return (
      <Host>
        <int-overlay style={{ display: `${this.isEnabled() ? 'block' : 'none'}` }}>
          <slot></slot>
        </int-overlay>
      </Host>
    );
  }

}
