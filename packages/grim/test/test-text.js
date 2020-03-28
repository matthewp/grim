import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('Inserting {{text}}', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`
      <span>Hello {{name}}</span>
    `);
    let template = stamp(raw);
    let frag = template.createInstance({ name: 'world' });
    assert.equal(frag.firstElementChild.textContent, 'Hello world');
  });

  QUnit.test('Multiple parts in same element', assert => {
    let raw = createTemplate('<span>{{foo}} {{bar}}</span>');
    let template = stamp(raw);
    let frag = template.createInstance({ foo: 'one', bar: 'two' });
    let span = frag.firstElementChild;

    assert.equal(span.textContent, 'one two');
    frag.update({ foo: 'three', bar: 'four' });
    assert.equal(span.textContent, 'three four');
  });
});