import {Component, Host, h, Element, Prop, State, Listen, Watch, Method} from '@stencil/core';

type Edge = "top" | "left" | "bottom" | "right" | null;
type Position = "center" | "min" | "max" | number;
type Coordinates = {x: Number, y: Number};

@Component({
  tag: 'int-overlay',
  styleUrl: 'overlay.css',
  shadow: true
})
export class Overlay {
  resizeTimer;
  hasFooter: boolean;
  anchorElement: Element;
  resolverFailedEdgePasses = [];
  @Element() el: Element;
  @State() positionX = 0;
  @State() positionY = 0;
  @Prop() anchor: any = null;
  @Prop() modal: boolean;
  @Prop() header: string;
  @Prop() arrow: boolean;
  @Prop() edge: Edge = null;
  @Prop() x: Position = "center";
  @Prop() y: Position = "center";
  @Prop() useResolver: boolean = true;
  

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

  @Watch('edge')
  @Watch('x')
  @Watch('y')
  @Method()
  updatePositioning() {
    this.refreshPosition();
  }
  /*
  calculatePosition(desiredEdge: Edge, x: Position, y: Position, anchorRect: ClientRect, contentRect: ClientRect): Coordinates {
    if (this.anchorElement) {
      const targetBounds: ClientRect = this.anchorElement.getBoundingClientRect();

      switch(desiredEdge) {
        case "top":
          this.positionY = targetBounds.top - contentBounds.height - numericY;
           break;
        case "bottom":
          this.positionY = targetBounds.bottom + numericY;
          break;
        case "left":
          this.positionX = targetBounds.left - contentBounds.width - numericX;
          break;
        case "right":
          this.positionX = targetBounds.right + numericX;
          break;
      }
      if (desiredEdge === "bottom" || desiredEdge === "top") {
        if (desiredX === "min") {
          this.positionX = targetBounds.left;
        } else if (desiredX === "max") {
          this.positionX = targetBounds.right - contentBounds.width;
        } else if (desiredX === "center") {
          this.positionX = (targetBounds.left + (targetBounds.width/2)) - (contentBounds.width/2);
        }
      }
      if (desiredEdge === "left" || desiredEdge === "right") {
        if (desiredY === "min") {
          this.positionY = targetBounds.top;
        } else if (desiredY === "max") {
          this.positionY = targetBounds.bottom - contentBounds.height;
        } else if (desiredY === "center") {
          this.positionY = (targetBounds.top + (targetBounds.height/2)) - (contentBounds.height/2);
        } else {
          this.positionY = targetBounds.top + Number(desiredY);
        }
      }

      // if current position cannot fit entire within the screen, move to another edge via resolverFailedEdgePasses
      if (this.positionY <= 0 && desiredEdge === "top") {
        desiredEdge = "bottom";
      } else if (this.positionY + contentBounds.height >= viewport.height && desiredEdge === "bottom") {
        desiredEdge = "top";
      }
      if (this.positionX < 0 && desiredEdge === "left") {
        desiredEdge = "right";
      } else if (this.positionX + contentBounds.width >= viewport.width && desiredEdge === "right") {
        desiredEdge = "left";
      }

    } else {
      
      if (desiredX === "center") {
        this.positionX = (viewport.width/2) - (contentBounds.width/2);
      } else if (desiredX === "min") {
        this.positionX = 0;
      } else if (desiredX === "max") {
        this.positionX = viewport.width - contentBounds.width;
      } else {
        this.positionX = numericX;
      }
      
      if (desiredY === "center") {
        this.positionY = (viewport.height/2) - (contentBounds.height/2);
      } else if (desiredY === "min") {
        this.positionY = 0;
      } else if (desiredY === "max") {
        this.positionY = viewport.height - contentBounds.height;
      } else {
        this.positionY = numericY;
      }

    }
    return {
      x: 0,
      y: 0
    }
  }
  */

  refreshPosition() {
    const viewport = {width: window.innerWidth, height: window.innerHeight};
    const content: Element = this.el.shadowRoot.querySelector('.content');
    const contentBounds: ClientRect = content.getBoundingClientRect();
    const arrowOffset = 20;
    let desiredEdge = this.edge;
    let oppositeEdge;
    let desiredX = this.x;
    let numericX = ((Number.isNaN(Number(this.x))) ? 0 : Number(this.x));
    let desiredY = this.y;
    let numericY = ((Number.isNaN(Number(this.y))) ? 0 : Number(this.y));
    
    if (this.arrow) {
      switch (desiredEdge) {
        case("top"): numericY -= arrowOffset; break;
        case("bottom"): numericY += arrowOffset; break;
        case("left"): numericX -= arrowOffset; break;
        case("right"): numericX += arrowOffset; break;
      }
    }

    if (this.anchorElement) {
      const targetBounds: ClientRect = this.anchorElement.getBoundingClientRect();

      switch(desiredEdge) {
        case "top":
          this.positionY = targetBounds.top - contentBounds.height - numericY;
           break;
        case "bottom":
          this.positionY = targetBounds.bottom + numericY;
          break;
        case "left":
          this.positionX = targetBounds.left - contentBounds.width - numericX;
          break;
        case "right":
          this.positionX = targetBounds.right + numericX;
          break;
      }
      if (desiredEdge === "bottom" || desiredEdge === "top") {
        if (desiredX === "min") {
          this.positionX = targetBounds.left;
        } else if (desiredX === "max") {
          this.positionX = targetBounds.right - contentBounds.width;
        } else if (desiredX === "center") {
          this.positionX = (targetBounds.left + (targetBounds.width/2)) - (contentBounds.width/2);
        }
      }
      if (desiredEdge === "left" || desiredEdge === "right") {
        if (desiredY === "min") {
          this.positionY = targetBounds.top;
        } else if (desiredY === "max") {
          this.positionY = targetBounds.bottom - contentBounds.height;
        } else if (desiredY === "center") {
          this.positionY = (targetBounds.top + (targetBounds.height/2)) - (contentBounds.height/2);
        } else {
          this.positionY = targetBounds.top + Number(desiredY);
        }
      }

      // if current position cannot fit entire within the screen, move to another edge via resolverFailedEdgePasses
      if (this.positionY <= 0 && desiredEdge === "top") {
        desiredEdge = "bottom";
      } else if (this.positionY + contentBounds.height >= viewport.height && desiredEdge === "bottom") {
        desiredEdge = "top";
      }
      if (this.positionX < 0 && desiredEdge === "left") {
        desiredEdge = "right";
      } else if (this.positionX + contentBounds.width >= viewport.width && desiredEdge === "right") {
        desiredEdge = "left";
      }

    } else {
      
      if (desiredX === "center") {
        this.positionX = (viewport.width/2) - (contentBounds.width/2);
      } else if (desiredX === "min") {
        this.positionX = 0;
      } else if (desiredX === "max") {
        this.positionX = viewport.width - contentBounds.width;
      } else {
        this.positionX = numericX;
      }
      
      if (desiredY === "center") {
        this.positionY = (viewport.height/2) - (contentBounds.height/2);
      } else if (desiredY === "min") {
        this.positionY = 0;
      } else if (desiredY === "max") {
        this.positionY = viewport.height - contentBounds.height;
      } else {
        this.positionY = numericY;
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
