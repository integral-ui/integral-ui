import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'int-card',
  styleUrl: 'card.css',
  shadow: true
})
export class Card {

  @Prop() schema: 'person' | 'organization' | 'event' | 'product' | ;

  render() {
    return (
      <Host className={this.schema}>
        {/* <div class="image"> */}
          <slot name="image"></slot>
        {/* </div> */}
        {/* <div class="header"> */}
          <slot name="header"></slot>
        {/* </div> */}
        {/* <div class="body"> */}
          <slot name="body"></slot>
        {/* </div> */}
        {/* <div class="footer"> */}
          <slot name="footer"></slot>
        {/* </div> */}
      </Host>
    );
  }

}
