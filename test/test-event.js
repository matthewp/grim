import { stamp } from '../tmpl.js';
import { createTemplate } from './helpers.js';

QUnit.module('Inserting @event=cb', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`<button @click="value"></button>`);
    let template = stamp(raw);
    function onclick() {
      assert.ok(true, 'event handler worked');
    }
    let frag = template.createInstance({ value: onclick });
    let btn = frag.firstElementChild;
    btn.dispatchEvent(new MouseEvent('click'));
  });
});