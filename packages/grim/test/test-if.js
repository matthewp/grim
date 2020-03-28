import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('<template $if=cond>', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`
      <p>
        it <template $if="cond">be</template> lit
      </p>
    `);
    let template = stamp(raw);
    let frag = template.createInstance({ cond: false });
    let p = frag.firstElementChild;
    assert.equal(p.textContent.trim(), 'it  lit');

    frag.update({ cond: true });
    assert.equal(p.textContent.trim(), 'it be lit');
  });
});