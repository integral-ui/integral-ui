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
	hasFooter = false;
	hasHeader = false;
	anchorElement: Element;
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

	componentWillLoad() {
		const headerSlot = this.el.querySelector('[slot="header"]');
		const footerSlot = this.el.querySelector('[slot="footer"]');
		this.hasHeader = !!headerSlot;
		this.hasFooter = !!footerSlot;
	}

	componentDidLoad() {
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

	@Listen('resize', { target: 'window', passive: true })
	updateFromResize() {
		window.clearTimeout(this.resizeTimer);
		this.resizeTimer = window.setTimeout(() => this.setPosition(), 0);
	}
	
	@Listen('scroll', { target: 'window', passive: true })
	updateFromScroll() {
		window.clearTimeout(this.resizeTimer);
		this.resizeTimer = window.setTimeout(() => this.setPosition(), 0);
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
		let alternateEdge;

		// Positioning with and without a relative anchor point
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

		// Evaluate opposite edge for better fit
		if (edge === "top" && positionY < 0 ) {
			alternateEdge = "bottom";

		} else if (edge === "bottom" && positionY + contentRect.height > viewport.height) {
			alternateEdge = "top";

		} else if (edge === "left" && positionX < 0) {
			alternateEdge = "right";

		} else if (edge === "right" && positionX + contentRect.width > viewport.width) {
			alternateEdge = "left";
		}		
		if (alternateEdge) {
			let newPos = this.calculatePosition(alternateEdge, this.x, this.y, offset, contentRect, anchorRect);
			edge = newPos.edge;
			positionX = newPos.x;
			positionY = newPos.y;
		}

		// Keep overlay on-screen (unless anchor is clipped)
		if (!anchorRect || (anchorRect.left > 0 && anchorRect.top > 0 && anchorRect.right < viewport.width && anchorRect.bottom < viewport.height )) {

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
		}

		return {
			edge: edge,
			x: Math.round(positionX),
			y: Math.round(positionY)
		}
	}

	setPosition() {
		const content: Element = this.el.shadowRoot.querySelector('.content');
		const contentRect: ClientRect = content.getBoundingClientRect();
		const targetBounds: ClientRect = (this.anchorElement) ? this.anchorElement.getBoundingClientRect() : undefined;
		const arrowWidthHeight = (this.arrow) ? 10 : 0;

		let loc: Location = this.calculatePosition(this.edge, this.x, this.y, arrowWidthHeight, contentRect, targetBounds);

		if (loc.x !== this.positionX) {
			this.positionX = loc.x;
		}
		if (loc.y !== this.positionY) {
			this.positionY = loc.y;
		}

		if (this.arrow) {
			let [start, p0, p1, p2, arrowOffset] = [0,0,0,0,0];
			this.arrowEdge = loc.edge;
			let plane = (loc.edge === 'bottom' || loc.edge === 'top') ? 'X' : 'Y';
			if (this.arrowEdge === "top" || this.arrowEdge === "bottom") {
				[p0, p1, p2] = [targetBounds.left, targetBounds.right, this.positionX, this.positionX + contentRect.width].sort((a,b) => a - b)
				start = (this.positionX <= targetBounds.left) ? p1 - p0 : 0
			} else {
				[p0, p1, p2] = [targetBounds.top, targetBounds.bottom, this.positionY, this.positionY + contentRect.height].sort((a,b) => a - b)
				start = (this.positionY <= targetBounds.top) ? p1 - p0 : 0
			}
			arrowOffset = start + ( (p2 - p1) / 2 );
			let newTranslation = `translate${plane}(${arrowOffset}px)`;
			if (this.arrowTranslation !== newTranslation) {
				this.arrowTranslation = newTranslation;
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
					{this.hasHeader &&
						<div class="header">
							<slot name="header"></slot>
						</div>
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
