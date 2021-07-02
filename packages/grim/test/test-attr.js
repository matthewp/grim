import QUnit from './qunit.js';
import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('Inserting attr={{value}}', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`<span class="{{value}}"></span>`);
    let template = stamp(raw);
    let frag = template.createInstance({ value: 'one' });
    assert.equal(frag.firstElementChild.className, 'one');
  });

  QUnit.test('With other values', assert => {
    let raw = createTemplate(`<span class="val {{one}}"></span>`);
    let template = stamp(raw);
    let frag = template.createInstance({ one: 'two' });
    assert.equal(frag.firstElementChild.className, 'val two');
  });

  QUnit.test('With multiple insertions', assert => {
    let raw = createTemplate(`<span class="{{one}} space {{two}} more"></span>`);
    let template = stamp(raw);
    let frag = template.createInstance({ one: 'foo', two: 'bar' });
    assert.equal(frag.firstElementChild.className, 'foo space bar more');
  });

  QUnit.test('Multi templates don\'t conflict', assert => {
    let raw = createTemplate(`<span class="{{one}} space {{two}} more"></span>`);
    let template = stamp(raw);
    let frag1 = template.createInstance({ one: 'foo', two: 'bar' });
    let frag2 = template.createInstance({ one: 'baz', two: 'qux' });

    frag1.update({one: 'foo', two: 'new' });

    assert.equal(frag1.firstElementChild.className, 'foo space new more');
    assert.equal(frag2.firstElementChild.className, 'baz space qux more');
  });
});