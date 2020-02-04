import { newE2EPage } from '@stencil/core/testing';

describe('int-overlay', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<int-overlay></int-overlay>');

    const element = await page.find('int-overlay');
    expect(element).toHaveClass('hydrated');
  });
});
