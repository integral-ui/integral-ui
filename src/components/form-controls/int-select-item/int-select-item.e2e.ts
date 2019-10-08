import { newE2EPage } from '@stencil/core/testing';

describe('int-select-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<int-select-item></int-select-item>');

    const element = await page.find('int-select-item');
    expect(element).toHaveClass('hydrated');
  });
});
