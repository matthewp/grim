import { GrimElement } from '../grim-element.js';

let template = document.createElement('template');
template.innerHTML = `
  <div>Hello {{name}}</div>
`;

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

QUnit.module('Basics', () => {
  QUnit.test('Inserting text', async assert => {
    class HelloWorld extends GrimElement {
      static template = template;

      static properties = {
        name: { type: String }
      };
  
      constructor() {
        super();
        this.name = 'world';
      }
    }
    customElements.define('test-hello-world', HelloWorld);
    let el = new HelloWorld();
    el.connectedCallback();

    let div = el.shadowRoot.firstElementChild;
    await wait(1);

    assert.equal(div.textContent, 'Hello world');
  });
});