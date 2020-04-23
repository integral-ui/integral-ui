import { newE2EPage } from '@stencil/core/testing';

describe('int-icon', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<int-icon></int-icon>');

    const element = await page.find('int-icon');
    expect(element).toHaveClass('hydrated');
  });
});
