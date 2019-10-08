import { Component, h, Prop, EventEmitter, Event, Element, Host } from '@stencil/core';

@Component({
    tag: 'int-select-item',
    styleUrl: 'item.css',
    shadow: true
})
export class SelectItemComponent {
    _checked = false;
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = value;
    }
    uiqueID = `int-select-item_${Math.floor(Math.random() * 100000)}`;
    @Prop() value: any;
    @Event() selected: EventEmitter;
    @Element() el: Element;
    clickHandler(e) {
        e.preventDefault();
        this.checked = !this.checked;
        this.setValue(this.checked);
    }
    setValue(value) {
        this.checked = value;
        this.el.shadowRoot.querySelector('input').checked = this.checked;
        this.selected.emit({value: this.value, checked: this.checked});
    }
    render() {
        return (
            <Host onClick={(event) => this.clickHandler(event)}>
                <input type="checkbox" id={this.uiqueID} /><label htmlFor={this.uiqueID} ><slot/></label>
            </Host>
        )
    }
}