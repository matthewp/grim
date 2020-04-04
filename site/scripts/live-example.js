
customElements.define('live-example', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if(!this.shadowRoot.hasChildNodes()) {
      let tmpl = document.querySelector('#le-tmpl');
      let frag = document.importNode(tmpl.content, true);
      this.exampleEl = frag.querySelector('.insert');
      this.shadowRoot.append(frag);
      this.run();
    }
  }

  async run() {
    let mod = await import(this.getAttribute('src'));
    let fn = mod.default;
    this.exampleEl.append(fn());
  }
})