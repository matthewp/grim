import QUnit from './qunit.js';
import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('Inserting .prop=value', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`<span .something="value"></span>`);
    let template = stamp(raw);
    let frag = template.createInstance({ value: 'one' });
    assert.equal(frag.firstElementChild.something, 'one');
  });
});