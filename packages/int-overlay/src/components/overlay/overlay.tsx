import { Component, Host, h, Element, Prop, State, Listen, Watch, Method } from '@stencil/core';

export type Edge = "top" | "left" | "bottom" | "right";
export type Pos = "center" | "min" | "max" | number;
export type Coords = { x: number, y: number };
export interface Location {
	edge: Edge,
	x: number,
	y: number
}

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
	arrowEdge: Edge;
	@Element() el: Element;
	@State() positionX = 0;
	@State() positionY = 0;
	@State() arrowTranslation = '';
	@Prop() anchor: any = null;
	@Prop() modal: boolean;
	@Prop() header: string;
	@Prop() arrow: boolean;
	@Prop() edge: Edge = "bottom";
	@Prop() inset: boolean = false;
	@Prop() x: Pos = "center";
	@Prop() y: Pos = "center";

	constructor() {}

	connectedCallback() {
	}

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
		}).then(() => {
			this.setPosition()
		})
	}

	componentDidUnload() {
		window.clearTimeout(this.resizeTimer);
	}

	componentWillUpdate() {
		// this.setPosition();
	}

	componentDidUpdate() {
		this.setPosition();
	}

	@Listen('resize', { target: 'window', passive: true })
	updateFromResize() {
		window.clearTimeout(this.resizeTimer);
		this.resizeTimer = window.setTimeout(() => this.setPosition(), 25);
	}

	@Watch('edge')
	@Watch('x')
	@Watch('y')
	@Method()
	updatePositioning() {
		this.setPosition();
	}

	calculatePosition(edge: Edge, x: Pos, y: Pos, offset: number, contentRect: ClientRect, anchorRect?: ClientRect): Location {
		const viewport = { width: window.innerWidth, height: window.innerHeight };
		const numericX = ((Number.isNaN(Number(x))) ? 0 : Number(x));
		const numericY = ((Number.isNaN(Number(y))) ? 0 : Number(y));
		let positionX = 0;
		let positionY = 0;

		if (anchorRect) {
			switch (edge) {
				case "top":
					positionY = anchorRect.top - contentRect.height - offset - numericY;
					break;
				case "bottom":
					positionY = anchorRect.bottom + offset + numericY;
					break;
				case "left":
					positionX = anchorRect.left - contentRect.width - offset - numericX;
					break;
				case "right":
					positionX = anchorRect.right + offset + numericX;
					break;
			}
			if (edge === "bottom" || edge === "top") {
				if (x === "min") {
					positionX = anchorRect.left;
				} else if (x === "max") {
					positionX = anchorRect.right - contentRect.width;
				} else if (x === "center") {
					positionX = (anchorRect.left + (anchorRect.width / 2)) - (contentRect.width / 2);
				} else {
					positionX = anchorRect.left + Number(x);
				}
				
			}
			if (edge === "left" || edge === "right") {
				if (y === "min") {
					positionY = anchorRect.top;
				} else if (y === "max") {
					positionY = anchorRect.bottom - contentRect.height;
				} else if (y === "center") {
					positionY = (anchorRect.top + (anchorRect.height / 2)) - (contentRect.height / 2);
				} else {
					positionY = anchorRect.top + Number(y);
				}
				
			}

		} else {

			if (x === "center") {
				positionX = (viewport.width / 2) - (contentRect.width / 2);
			} else if (x === "min") {
				positionX = 0;
			} else if (x === "max") {
				positionX = viewport.width - contentRect.width;
			} else {
				positionX = Number(x);
			}

			if (y === "center") {
				positionY = (viewport.height / 2) - (contentRect.height / 2);
			} else if (y === "min") {
				positionY = 0;
			} else if (y === "max") {
				positionY = viewport.height - contentRect.height;
			} else {
				positionY = Number(y);
			}

		}
		if (positionX + contentRect.width > viewport.width) {
			positionX = positionX - (positionX + contentRect.width - viewport.width)
		}
		if (positionX < 0) {
			positionX = 0;
		}
		if (positionY + contentRect.height > viewport.height) {
			positionY = positionY - (positionY + contentRect.height - viewport.height)
		}
		if (positionY < 0) {
			positionY = 0;
		}
		return {
			edge: edge,
			x: positionX,
			y: positionY
		}
	}

	setPosition() {
		const viewport = { width: window.innerWidth, height: window.innerHeight };
		const content: Element = this.el.shadowRoot.querySelector('.content');
		const contentRect: ClientRect = content.getBoundingClientRect();
		const targetBounds: ClientRect = (this.anchorElement) ? this.anchorElement.getBoundingClientRect() : undefined;
		const arrowWidthHeight = (this.arrow) ? 10 : 0;
		let newEdge;

		let loc: Location = this.calculatePosition(this.edge, this.x, this.y, arrowWidthHeight, contentRect, targetBounds);

		if (loc.y <= 0 && loc.edge === "top") {
			newEdge = "bottom";
		} else if (loc.y + contentRect.height >= viewport.height && loc.edge === "bottom") {
			newEdge = "top";
		}
		if (loc.x < 0 && loc.edge === "left") {
			newEdge = "right";
		} else if (loc.x + contentRect.width >= viewport.width && loc.edge === "right") {
			newEdge = "left";
		}
		if (newEdge) {
			loc = this.calculatePosition(newEdge, this.x, this.y, arrowWidthHeight, contentRect, targetBounds);
		}

		this.positionX = Math.round(loc.x);
		this.positionY = Math.round(loc.y);

		if (this.arrow) {
			let start = 0, p0, p1, p2, p3, arrowOffset = 0;
			this.arrowEdge = loc.edge;
			if (this.arrowEdge === "top" || this.arrowEdge === "bottom") {
				[p0, p1, p2, p3] = [targetBounds.left, targetBounds.right, contentRect.left, contentRect.right].sort((a,b) => a - b)
				start = (contentRect.left <= targetBounds.left) ? p1 - p0 : 0
				arrowOffset = start + ( (p2 - p1) / 2 ) - ( arrowWidthHeight / 2 );
				this.arrowTranslation = `translateX(${arrowOffset}px)`;

			} else {
				[p0, p1, p2, p3] = [targetBounds.top, targetBounds.bottom, contentRect.top, contentRect.bottom].sort((a,b) => a - b)
				start = (contentRect.top <= targetBounds.top) ? p1 - p0 : 0
				arrowOffset = start + ( (p2 - p1) / 2 ) - ( arrowWidthHeight / 2 );
				this.arrowTranslation = `translateY(${arrowOffset}px)`;
			}
		}		

	}
	render() {
		return (
			<Host class={this.modal ? "hasModalBackdrop" : ""}>
				<div class="content" style={{ transform: `translate(${this.positionX}px, ${this.positionY}px)` }}>
					{this.arrow &&
						<div class="arrow" data-edge={this.arrowEdge} style={{ transform: this.arrowTranslation }}></div>
					}
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
