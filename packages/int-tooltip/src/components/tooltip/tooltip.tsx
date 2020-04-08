import { Component, Host, h, Prop, State, Listen, Element, EventEmitter, Event } from '@stencil/core';
import { Pos, Edge } from '@integral-ui/int-overlay/dist/types/components/overlay/overlay';
import "@integral-ui/int-overlay";

@Component({
  tag: 'int-tooltip',
  styleUrl: 'tooltip.css',
  shadow: true
})
export class Tooltip {

  private overlay: HTMLIntOverlayElement;
  private listener;

  @Element() host: Element;

  @State() displayTooltip: boolean = false;
  @State() x: Pos;
  @State() y: Pos;

  @Prop() selector: string = '[data-int-tooltip]';
  @Prop() offsetX: number = 12;
  @Prop() offsetY: number = 12;
  @Prop() edge: Edge;
  @Prop() arrow: boolean;

  @Event() integralShowTooltip: EventEmitter;
  @Event() integralHideTooltip: EventEmitter;

  constructor() {
  }

  @Listen('mouseover', { target: 'body', capture: true, passive: true })
  enableTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.matches(this.selector)) {
      if (!this.edge) {
        this.attachListener(target);
      } else {
        this.overlay.anchor = event.target;
        this.overlay.arrow = true;
      }
      this.enable(target);
    }
  }

  @Listen('mouseout', { target: 'body', capture: true, passive: true })
  disableTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.matches(this.selector)) {
      this.detachListener(target);
      this.disable(target);
    }
  }

  componentDidLoad() {
    this.overlay = this.host.shadowRoot.querySelector("int-overlay");
  }

  enable(target) {
    this.displayTooltip = true;
    this.integralShowTooltip.emit({
      target: target,
      tooltip: this.host
    });
  }

  disable(target) {
    this.displayTooltip = false;
    this.integralHideTooltip.emit({
      target: target,
      tooltip: this.host
    });
  }

  isEnabled() {
    return this.displayTooltip;
  }

  attachListener(target) {
    this.listener = (event) => {
      this.trackPosition(event);
    };
    target.addEventListener('mousemove', this.listener);
  }
  
  detachListener(target) {
    target.removeEventListener('mousemove', this.listener);
  }

  trackPosition(event: MouseEvent) {
    this.x = event.clientX + this.offsetX;
    this.y = event.clientY + this.offsetY;
  }

  render() {
    return (
      <Host>
        <int-overlay x={this.x} y={this.y} edge={this.edge} style={{visibility: `${this.isEnabled() ? 'visible' : 'hidden'}`}} >
          <slot></slot>
        </int-overlay>
      </Host>
    );
  }

}
