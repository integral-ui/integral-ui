import { Component, Host, h, Prop } from '@stencil/core';
import "@integral-ui/int-overlay";

@Component({
  tag: 'int-tooltip',
  styleUrl: 'tooltip.css',
  shadow: true
})
export class Tooltip {

  @Prop()
  selector: string = '[data-int-tooltip]';
  
  @Prop()
  content: string;
  
  @Prop()
  requireClose: boolean = false;

  componentDidLoad() {
    
  }

  render() {
    return (
      <Host>
        <int-overlay>overlay</int-overlay>
        <slot></slot>
      </Host>
    );
  }

}
