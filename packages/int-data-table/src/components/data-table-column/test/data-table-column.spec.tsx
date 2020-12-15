import { newSpecPage } from '@stencil/core/testing';
import { DataTableColumn } from '../data-table-column';

describe('data-table-column', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [DataTableColumn],
      html: `<data-table-column></data-table-column>`,
    });
    expect(page.root).toEqualHtml(`
      <data-table-column>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </data-table-column>
    `);
  });
});
