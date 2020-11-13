import { newE2EPage } from '@stencil/core/testing';

describe('int-option', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<int-option></int-option>');

    const element = await page.find('int-option');
    expect(element).toHaveClass('hydrated');
  });
});
