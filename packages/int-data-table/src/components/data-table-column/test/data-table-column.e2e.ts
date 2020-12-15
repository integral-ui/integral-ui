import { newE2EPage } from '@stencil/core/testing';

describe('data-table-column', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<data-table-column></data-table-column>');

    const element = await page.find('data-table-column');
    expect(element).toHaveClass('hydrated');
  });
});
