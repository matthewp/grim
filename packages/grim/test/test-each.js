import { stamp } from '../grim.js';
import { createTemplate } from './helpers.js';

QUnit.module('<template $each=cond>', () => {
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
  })
});