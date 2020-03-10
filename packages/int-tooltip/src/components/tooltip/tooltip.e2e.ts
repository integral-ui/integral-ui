import { newE2EPage } from '@stencil/core/testing';

describe('int-tooltip', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<int-tooltip></int-tooltip>');

    const element = await page.find('int-tooltip');
    expect(element).toHaveClass('hydrated');
  });
});
