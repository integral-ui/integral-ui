import { newE2EPage } from '@stencil/core/testing';

describe('int-checkbox', () => {
  it('should render an int-checkbox', async () => {
    const page = await newE2EPage();
    await page.setContent(`<int-checkbox></int-checkbox>`);
    const el = await page.find('int-checkbox');
    expect(el).not.toBeNull();
  });
});