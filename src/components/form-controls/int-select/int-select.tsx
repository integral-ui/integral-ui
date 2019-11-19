import { Component, h, Host, Prop, Event, EventEmitter, Listen, Element } from '@stencil/core';

@Component({
    tag: 'int-select',
    styleUrl: 'int-select.css',
    shadow: true
})
export class IntSelect {
    valueHash = {};
    @Element() el: HTMLElement;
    @Prop() value = [];
    @Prop() name: string;
    @Prop() placeholder: string = 'Please select';
    @Event() changed: EventEmitter;

    @Listen('selected')
    selectionLogic(e) {
        e.stopPropagation();
        this.valueHash[e.target.value] = e.target.checked;
        this.value = Object.keys(this.valueHash).filter(key => this.valueHash[key]);
        this.changed.emit();
    }

    @Listen('click', { target: 'document' })
    handleSelection(e) {
        if (this.el === e.target) {
            this.el.classList.toggle('showOption');
        } else if (!this.el.contains(e.target)) {
            this.el.classList.remove('showOption');
        } else {
            this.el.classList.add('showOption');
        }
    }

    componentDidLoad() {
        try {
            Array.from(this.value).forEach((value: string) => {
                this.valueHash[value] = true;
            })
        } catch (e) {
            if (this.value) {
                throw Error(`${this.value} is not properly formatted. Value must be in the format value='["key", "key"]'`);
            }
        }
    }

    render() {
        return (
            <Host>
                <div class="hotspot">{this.placeholder}</div>
                <div class="flyout">
                    <slot />
                </div>
            </Host>
        )
    }
}