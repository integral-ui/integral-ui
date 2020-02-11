import {Component, Host, h, Element, Prop, State, Listen, Watch} from '@stencil/core';

@Component({
  tag: 'int-overlay',
  styleUrl: 'overlay.css',
  shadow: true
})
export class Overlay {
  resizeTimer;
  hasFooter: boolean;
  anchorElement: Element;
  @Element() el: Element;
  @State() positionX = 0;
  @State() positionY = 0;
  @Prop() anchor: any = null;
  @Prop() modal: boolean;
  @Prop() header: string;
  @Prop() x: string = "center";
  @Prop() y: string = "center";

  componentWillLoad() {
  }

  componentDidLoad() {
    const footerSlot = this.el.shadowRoot.querySelector<HTMLSlotElement>('slot[name="footer"]');
    this.hasFooter = !!footerSlot?.assignedElements().length; 
    if (this.anchor !== null) {
      if (typeof this.anchor === "string") {
        try {
          this.anchorElement = document.querySelector(this.anchor);
        } catch {
          throw new Error('Anchor is not a valid selector')
        }
      } else if (this.anchor.nodeName) {
        this.anchorElement = this.anchor;
      } else {
        throw new Error('Anchor must be a valid selector or DOM element')
      }

    }
    return new Promise((resp) => {
      resp();
    }).then(() => this.refreshPosition())
  }

  componentDidUnload() {
    window.clearTimeout(this.resizeTimer);
  }

  componentDidUpdate() {
    this.refreshPosition();
  }

  @Listen('resize', { target: 'window' })
  updateFromResize() {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this.refreshPosition(), 100);
  }

  @Watch('x')
  @Watch('y')
  updatePositioning() {
    this.refreshPosition();
  }

  refreshPosition() {
    const viewport = {width: window.innerWidth, height: window.innerHeight};
    const content = this.el.shadowRoot.querySelector('.content');
    const contentBounds: ClientRect = content.getBoundingClientRect();
    let desiredX:string|number = this.x;

    if (this.anchorElement) {
      const targetBounds: ClientRect = this.anchorElement.getBoundingClientRect();
      /*
      PRIORITY: set VERTICAL first, HORIZONTAL second
      Eg: Top Left => top of target vertically, align left edges horizontally
      Eg: Center Left => center of target vertically, align left edge of target w/ right edge of overlay
      */
      if (this.y === "top") {
        this.positionY = targetBounds.top - contentBounds.height;
      } else if (this.y === "bottom") {
        this.positionY = targetBounds.bottom;
      } else if (this.y === "center") {
        this.positionY = (targetBounds.top + (targetBounds.height/2)) - (contentBounds.height/2);
      } else {
        // number is relative to target 
        this.positionY = targetBounds.top + (+this.y);
      }

      // if VERT position is within top to bottom edge of target, force HORZ outside of target
      if (this.positionY >= targetBounds.top && this.positionY < targetBounds.bottom) {
        if (desiredX === "left") {
          desiredX = -contentBounds.width;
        } else if (desiredX === "right") {
          desiredX = targetBounds.width;
        }
      }

      if (desiredX === "left") {
        this.positionX = targetBounds.left;
      } else if (desiredX === "right") {
        this.positionX = targetBounds.right - contentBounds.width;
      } else if (desiredX === "center") {
        this.positionX = (targetBounds.left + (targetBounds.width/2)) - (contentBounds.width/2);
      } else {
        // number is relative to target
        this.positionX = targetBounds.left + (+desiredX);
      }


    } else {
      
      if (this.x === "center") {
        this.positionX = (viewport.width/2) - (contentBounds.width/2);
      } else if (this.x === "left") {
      } else if (this.x === "right") {
      } else {
        this.positionX = +this.x;
      }
      
      if (this.y === "center") {
        this.positionY = (viewport.height/2) - (contentBounds.height/2);
      } else if (this.y === "top") {
      } else if (this.y === "bottom") {
      } else {
        this.positionY = +this.y;
      }

    }

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
