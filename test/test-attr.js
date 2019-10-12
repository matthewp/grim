import { stamp } from '../tmpl.js';
import { createTemplate } from './helpers.js';

QUnit.module('Inserting attr={{value}}', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`<span class="{{value}}"></span>`);
    let template = stamp(raw);
    let frag = template.createInstance({ value: 'one' });
    assert.equal(frag.firstElementChild.className, 'one');
  });

  QUnit.skip('With other values (Not implemented)', assert => {
    let raw = createTemplate(`<span class="val {{one}}"></span>`);
    let template = stamp(raw);
    let frag = template.createInstance({ one: 'two' });
    assert.equal(frag.firstElementChild.className, 'val two');
  });
});