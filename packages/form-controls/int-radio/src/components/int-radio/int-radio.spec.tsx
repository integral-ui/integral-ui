import { newSpecPage } from '@stencil/core/testing';
import { IntRadio } from './int-radio';

describe('int-radio', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IntRadio],
      html: `<int-radio></int-radio>`,
    });
    expect(page.root).toEqualHtml(`
      <int-radio>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </int-radio>
    `);
  });
});
