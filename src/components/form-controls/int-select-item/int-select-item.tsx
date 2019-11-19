import { Component, Host, h, EventEmitter, Prop, Event, Element } from '@stencil/core';

@Component({
    tag: 'int-select-item',
    styleUrl: 'int-select-item.css',
    shadow: true
})
export class IntSelectItem {
    @Element() el: Element;
    @Prop({ mutable: true, reflect: true }) checked: boolean;
    @Prop({ mutable: true, reflect: true }) value: any;
    @Event() selected: EventEmitter;
    clickHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        this.checked = !this.checked;
        this.setValue();
    }
    setValue() {
        const nativeCheckboxEl: HTMLInputElement = this.el.querySelector('[type=checkbox]');
        const integralCheckboxEl: HTMLIntCheckboxElement = this.el.querySelector('int-checkbox');
        if (nativeCheckboxEl || integralCheckboxEl) {
            (nativeCheckboxEl || integralCheckboxEl).checked = this.checked;
        }
        this.selected.emit();
    }
    render() {
        return (
            <Host onClick={(event) => this.clickHandler(event)}>
                <slot />
            </Host>
        )
    }
}
