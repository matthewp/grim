import QUnit from './qunit.js';
import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('Rehydration', () => {
  QUnit.test('Can use existing DOM', assert => {
    let raw = createTemplate(`
      <span id="{{id}}">Hello {{name}}</span>
    `);
    let template = stamp(raw);
    let shadow = template.createInstance({ name: 'world', id: 1 }).cloneNode(true);
    let frag = template.adopt(shadow);

    assert.equal(frag.firstElementChild.textContent, 'Hello world');
    assert.equal(frag.firstElementChild.id, 1);

    frag.update({ name: 'Wilbur', id: 2 });

    assert.equal(frag.firstElementChild.textContent, 'Hello Wilbur');
    assert.equal(frag.firstElementChild.id, 2);
  });
});