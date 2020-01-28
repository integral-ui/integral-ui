import { newSpecPage } from '@stencil/core/testing';
import { IntCheckbox } from './int-checkbox';

describe('int-checkbox', () => {
  it('builds', () => {
    expect(new IntCheckbox()).toBeTruthy();
  });

  describe('events', () => {
    let page;
    let eventSpy;

    // START: unchecked
    describe('unchecked int-checkbox', () => {
      beforeEach(async () => {
        eventSpy = jest.fn();
        page = await newSpecPage({
          components: [IntCheckbox],
          html: `<int-checkbox></int-checkbox>`,
        });  
      });
  
      it('should emit changed event once when checked', async () => {
        expect.assertions(1);
        page.root.addEventListener('changed', eventSpy);
        page.root.setAttribute('checked', 'true');
        await page.waitForChanges();
    
        expect(eventSpy).toHaveBeenCalledTimes(1);
      });

      it('should emit changed event once when indeterminate', async () => {
        expect.assertions(1);
        page.root.addEventListener('changed', eventSpy);
        page.root.setAttribute('indeterminate', 'true');
        await page.waitForChanges();
    
        expect(eventSpy).toHaveBeenCalledTimes(1);
      });
    });
    // END: unchecked

    // START: checked
    describe('checked int-checkbox', () => {
      beforeEach(async () => {
        eventSpy = jest.fn();
        page = await newSpecPage({
          components: [IntCheckbox],
          html: `<int-checkbox checked></int-checkbox>`,
        });  
      });
  
      it('should emit changed event once when unchecked', async () => {
        expect.assertions(1);
        page.root.addEventListener('changed', eventSpy);
        page.root.removeAttribute('checked');
        await page.waitForChanges();
    
        expect(eventSpy).toHaveBeenCalledTimes(1);
      });

      it('should emit changed event once when indeterminate', async () => {
        expect.assertions(1);
        page.root.addEventListener('changed', eventSpy);
        page.root.setAttribute('indeterminate', 'true');
        await page.waitForChanges();
    
        expect(eventSpy).toHaveBeenCalledTimes(1);
      });
    });
    // END: checked

    // START: indeterminate
    describe('indeterminate int-checkbox', () => {
      beforeEach(async () => {
        eventSpy = jest.fn();
        page = await newSpecPage({
          components: [IntCheckbox],
          html: `<int-checkbox indeterminate></int-checkbox>`,
        });  
      });
  
      it('should emit changed event once when unchecked', async () => {
        expect.assertions(1);
        page.root.addEventListener('changed', eventSpy);
        page.root.removeAttribute('indeterminate');
        await page.waitForChanges();
    
        expect(eventSpy).toHaveBeenCalledTimes(1);
      });

      it('should not emit changed event once when checked', async () => {
        expect.assertions(1);
        page.root.addEventListener('changed', eventSpy);
        page.root.setAttribute('checked');
        await page.waitForChanges();
    
        expect(eventSpy).toHaveBeenCalledTimes(0);
      });
    });
    // END: checked
  });
});
