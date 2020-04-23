import { newSpecPage } from '@stencil/core/testing';
import { IntIcon } from './int-icon';

describe('int-icon', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IntIcon],
      html: `<int-icon></int-icon>`,
    });
    expect(page.root).toEqualHtml(`
      <int-icon>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </int-icon>
    `);
  });
});
