import {Component, Host, h, Element, Prop, State} from '@stencil/core';

@Component({
  tag: 'int-overlay',
  styleUrl: 'overlay.css',
  shadow: true
})
export class Overlay {
  @Element() el: Element;
  @State() hasFooter: boolean = true;
  @State() positionX = 0;
  @State() positionY = 0;
  @Prop({ mutable: true }) header: string;
  @Prop({ mutable: true }) top: string = "center";
  @Prop({ mutable: true }) left: string = "center";
  @Prop({ mutable: true }) modal: boolean;

  componentDidLoad() {
    const footerSlot = this.el.shadowRoot.querySelector<HTMLSlotElement>('slot[name="footer"]');
    this.hasFooter = !!footerSlot?.assignedElements().length;
    this.processPosition();
  }
  processPosition() {
    const viewport = {width: window.innerWidth, height: window.innerHeight};
    const content = this.el.shadowRoot.querySelector('.content');
    const contentBounds = content.getBoundingClientRect();

    if (this.top = "center") {
      this.positionY = (viewport.height/2) - (contentBounds.height/2);
    }
    if (this.left = "center") {
      this.positionX = (viewport.width/2) - (contentBounds.width/2);
    }

    return this.positionY
  }
  render() {
    return (
      <Host class={this.modal ? "hasModalBackdrop" : ""}>
        <div class="content" style={{transform: `translate(${this.positionX}px, ${this.positionY}px)`}}>
          {this.header &&
            <div class="header">{this.header}</div>
          }
          <div class="body">
            <slot name="body"></slot>
            <slot></slot>
          </div>
          {this.hasFooter &&
            <div class="footer">
              <slot name="footer"></slot>
            </div>
          }
        </div>
      </Host>
    );
  }
}
