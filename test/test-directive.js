import { stamp } from '../tmpl.js';
import { createTemplate } from './helpers.js';

QUnit.module('<span $directive>', () => {
  QUnit.test('Basics', assert => {
    let raw = createTemplate(`<span $book></span>`);
    let template = stamp(raw);
    let frag = template.createInstance({
      book: function(el, scope) {
        el.textContent = scope.foo;
      },
      foo: 'bar'
    });
    assert.equal(frag.firstElementChild.textContent, 'bar');
  });

  QUnit.test('Returned functions are called on updates', assert => {
    let raw = createTemplate(`<span $book></span>`);
    let template = stamp(raw);
    function book(el, scope) {
      let inner = stamp(createTemplate('<span>{{prop}}</span>'));
      let ifrag = inner.createInstance({ prop: scope.value });
      el.append(ifrag);

      return scope => ifrag.update({ prop: scope.value });
    }
    let frag = template.createInstance({ book, value: 'one' });
    let span = frag.firstElementChild.firstElementChild;
    assert.equal(span.textContent, 'one');

    frag.update({ book, value: 'two' });
    assert.equal(span.textContent, 'two');
  });
});