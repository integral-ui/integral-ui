import { newE2EPage } from '@stencil/core/testing';

describe('int-card', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<int-card></int-card>');

    const element = await page.find('int-card');
    expect(element).toHaveClass('hydrated');
  });
});
