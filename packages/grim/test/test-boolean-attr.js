import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('Inserting ?attr=cond', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`<button ?disabled="value"></button>`);
    let template = stamp(raw);
    let frag = template.createInstance({ value: true });
    let btn = frag.firstElementChild;

    assert.ok(btn.hasAttribute('disabled'));

    frag.update({ value: false });
    assert.notOk(btn.hasAttribute('disabled'));
  });
});