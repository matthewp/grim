import QUnit from './qunit.js';
import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('<template $each=cond>', () => {
  QUnit.module('Non-keyed', () => {
    QUnit.test('Basics', assert => {
      let raw = createTemplate(`
        <ul>
          <template $each="colors"><li>{{item}}</li></template>
        </ul>
      `);
      let template = stamp(raw);
      let frag = template.createInstance({
        colors: ['orange', 'red']
      });

      let one = frag.firstElementChild.firstElementChild;
      assert.equal(one.tagName, 'LI');
      assert.equal(one.textContent, 'orange');

      let two = one.nextElementSibling;
      assert.equal(two.tagName, 'LI');
      assert.equal(two.textContent, 'red');
    });

    QUnit.test('Emptying a list', assert => {
      let raw = createTemplate(`
        <ul>
          <template $each="colors"><li>{{item}}</li></template>
        </ul>
      `);
      let template = stamp(raw);
      let frag = template.createInstance({
        colors: ['orange']
      });

      let one = frag.firstElementChild.firstElementChild;
      assert.equal(one.tagName, 'LI');
      assert.equal(one.textContent, 'orange');

      frag.update({
        colors: []
      });

      one = frag.firstElementChild.firstElementChild;
      assert.equal(one, null, 'There is no element child now');
    });
  });

  QUnit.module('Keyed', () => {
    QUnit.test('Sorted in array order', assert => {
      let raw = createTemplate(`
        <ul>
          <template $each="colors" data-key="id"><li>{{item.label}}</li></template>
        </ul>
      `);
      let template = stamp(raw);
      let frag = template.createInstance({
        colors: [
          { id: 1, label: 'red' },
          { id: 2, label: 'yellow' },
          { id: 3, label: 'blue' }
        ]
      });
      let ul = frag.firstElementChild;
      assert.equal(ul.firstElementChild.textContent, 'red');
      assert.equal(ul.firstElementChild.nextElementSibling.textContent, 'yellow');
      assert.equal(ul.firstElementChild.nextElementSibling.nextElementSibling.textContent, 'blue');
    });

    QUnit.test('Reuse the correct node', assert => {
      let raw = createTemplate(`
        <ul>
          <template $each="colors" data-key="id"><li><input type="text" .value="item.label"></li></template>
        </ul>
      `);
      let template = stamp(raw);
      let frag = template.createInstance({
        colors: [{ id: 1, label: 'orange' }]
      });
      let one = frag.firstElementChild.firstElementChild.firstElementChild;
      one.value = 'testing';

      frag.update({
        colors: [{ id: 2, label: 'red' }, { id: 1, label: 'orange' }]
      });

      one = frag.firstElementChild.firstElementChild.firstElementChild;
      assert.equal(one.value, 'red');

      let two = frag.firstElementChild.firstElementChild.nextElementSibling.firstElementChild;
      assert.equal(two.value, 'testing');
    });

    QUnit.test('Can insert items in all positions', assert => {
      let raw = createTemplate(`
        <ul>
          <template $each="colors" data-key="id"><li>{{item.label}}</li></template>
        </ul>
      `);
      let template = stamp(raw);
      let frag = template.createInstance({
        colors: [
          { id: 2, label: 'red' },
          { id: 3, label: 'purple' },
          { id: 1, label: 'blue' }
        ]
      });
      let ul = frag.firstElementChild;

      assert.equal(ul.firstElementChild.textContent, 'red');
      assert.equal(ul.firstElementChild.nextElementSibling.textContent, 'purple');
      assert.equal(ul.firstElementChild.nextElementSibling.nextElementSibling.textContent, 'blue');

      frag.update({
        colors: [
          { id: 1, label: 'blue' },
          { id: 2, label: 'red' }
        ]
      });

      assert.equal(ul.firstElementChild.textContent, 'blue');
      assert.equal(ul.firstElementChild.nextElementSibling.textContent, 'red');
      assert.equal(ul.firstElementChild.nextElementSibling.nextElementSibling, null);

      frag.update({ colors:[] });
      assert.equal(ul.firstElementChild, null);
    });
  });
});