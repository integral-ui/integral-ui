import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'int-overlay',
  styleUrl: 'overlay.css',
  shadow: true
})
export class Overlay {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
