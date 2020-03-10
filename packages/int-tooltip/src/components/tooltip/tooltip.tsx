import { Component, Host, h, Prop } from '@stencil/core';

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

  render() {
    return (
      <Host>
        
        <slot></slot>
      </Host>
    );
  }

}
