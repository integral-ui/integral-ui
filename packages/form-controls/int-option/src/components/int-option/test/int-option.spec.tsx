import { newSpecPage } from '@stencil/core/testing';
import { IntOption } from './int-option';

describe('int-option', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IntOption],
      html: `<int-option></int-option>`,
    });
    expect(page.root).toEqualHtml(`
      <int-option>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </int-option>
    `);
  });
});
