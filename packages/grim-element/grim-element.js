import { UpdatingElement } from 'lit-element/lib/updating-element.js';
import { stamp } from 'grim2';

function handleEvent(prop, ev) {
  if(!(prop in this)) {
    throw new Error(`The element <${this.localName}> doesn't have the method [${prop}].`);
  }

  this[prop](ev);
}

class GrimElement extends UpdatingElement {
  constructor() {
    super();

    let template = stamp(new.target.template);
    this.instance = template.createInstance(this);
    this.renderRoot = this.createRenderRoot();

    // TODO this could be done better
    let viewModel = {};
    for(let part of this.instance.parts) {
      if(part.args && part.args.event) {
        let prop = part.prop;
        viewModel[prop] = {
          value: handleEvent.bind(this, prop)
        };
      }
    }
    this.viewModel = Object.create(this, viewModel);
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    super.connectedCallback();
    if(this.instance.hasChildNodes()) {
      this.renderRoot.append(this.instance);
    }
  }

  update() {
    this.instance.update(this.viewModel);
  }
}

export {
  GrimElement
};
