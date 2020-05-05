import { newE2EPage } from '@stencil/core/testing';

describe('int-radio', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<int-radio></int-radio>');

    const element = await page.find('int-radio');
    expect(element).toHaveClass('hydrated');
  });
});
