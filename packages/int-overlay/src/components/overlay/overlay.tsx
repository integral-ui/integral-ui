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
  @Prop() x: string | number = "center";
  @Prop() y: string | number = "center";
  @Prop() priority: "x" | "y" = "y";
  @Prop() edge: "top" | "left" | "bottom" | "right" = "bottom";
  @Prop() offset: "50%" | "0%" | "100%" | number = "50%";

  componentWillLoad() {
  }

  componentDidLoad() {
    const footerSlot = this.el.shadowRoot.querySelector<HTMLSlotElement>('slot[name="footer"]');
    this.hasFooter = !!footerSlot?.assignedElements().length; 
    if (this.anchor !== null) {
      // replace this with type guard
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

  @Watch('priority')
  @Watch('x')
  @Watch('y')
  updatePositioning() {
    this.refreshPosition();
  }

  refreshPosition() {
    const viewport = {width: window.innerWidth, height: window.innerHeight};
    const content: Element = this.el.shadowRoot.querySelector('.content');
    const contentBounds: ClientRect = content.getBoundingClientRect();
    const priority = this.priority;
    let desiredX: string | number = this.x;
    let desiredY: string | number = this.y;

    if (this.anchorElement) {
      const targetBounds: ClientRect = this.anchorElement.getBoundingClientRect();
      if (desiredY === "top") {
        this.positionY = targetBounds.top - contentBounds.height;
      } else if (desiredY === "bottom") {
        this.positionY = targetBounds.bottom;
      } else if (desiredY === "center") {
        this.positionY = (targetBounds.top + (targetBounds.height/2)) - (contentBounds.height/2);
      } else {
        // number is relative to target 
        this.positionY = targetBounds.top + (+desiredY);
      }

      if (desiredX === "left") {
        if (desiredY === "center") {
          this.positionX = targetBounds.left - contentBounds.width;
        } else {
          this.positionX = targetBounds.left;
        }
      } else if (desiredX === "right") {
        if (desiredY === "center") {
          this.positionX = targetBounds.right;
        } else {
          this.positionX = targetBounds.right - contentBounds.width;
        }
      } else if (desiredX === "center") {
        this.positionX = (targetBounds.left + (targetBounds.width/2)) - (contentBounds.width/2);
      } else {
        // number is relative to target
        this.positionX = targetBounds.left + (+desiredX);
      }

      // if (priority === "y") {
      //   // Align edges to top or bottom FIRST
      //   // right or left is outside of target
      //   if (this.positionY >= targetBounds.top && this.positionY < targetBounds.bottom) {
      //     if (desiredX === "left") {
      //       desiredY = -contentBounds.width;
      //     } else if (desiredX === "right") {
      //       desiredY = targetBounds.width;
      //     }
      //   }
      // }
      

      // if (priority === "x") {
      //   // Align edges to left or right FIRST
      //   // top or bottom is outside of target
      //   if (this.positionX >= targetBounds.left && this.positionX < targetBounds.right) {
      //     if (desiredY === "top") {
      //       desiredX = -contentBounds.width;
      //     } else if (desiredY === "bottom") {
      //       desiredX = targetBounds.width;
      //     }
      //   }
      // }



    } else {
      
      if (this.x === "center") {
        this.positionX = (viewport.width/2) - (contentBounds.width/2);
      } else if (this.x === "left") {
        this.positionX = 0;
      } else if (this.x === "right") {
        this.positionX = viewport.width - contentBounds.width;
      } else {
        this.positionX = +this.x;
      }
      
      if (this.y === "center") {
        this.positionY = (viewport.height/2) - (contentBounds.height/2);
      } else if (this.y === "top") {
        this.positionY = 0;
      } else if (this.y === "bottom") {
        this.positionY = viewport.height - contentBounds.height;
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
