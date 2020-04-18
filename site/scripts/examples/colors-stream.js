import { stamp } from '../grim.js';

const templateEl = document.createElement('template');
templateEl.innerHTML = /* html */ `
    <style>
      .demo-refresh-button {
        font-size: 90%;
        border: none;
        background: salmon;
        padding: .3rem;
      }
    </style>

  <h1>Favorite colors</h1>

  <button class="demo-refresh-button" @click="refresh">Refresh</button>
  <ul>
    <template $stream data-prop="colors">
      <li>{{item.label}}</li>
    </template>
  </ul>
`;

export default function() {
  let template = stamp(templateEl);

  async function *getColors() {
    let colors = [
      { id: 1, label: 'Red' },
      { id: 2, label: 'Blue' },
      { id: 3, label: 'Yellow' }
    ];
  
    while(colors.length) {
      await new Promise(r => setTimeout(r, 1000));
      yield colors.shift();
    }
  }

  function streamDirective(element, data) {
    let templateEl = document.createElement('template');
    templateEl.innerHTML = `
      <template $each="values">
        ${element.innerHTML}
      </template>
    `;
    let template = stamp(templateEl);
    let frag = template.createInstance({
      values: []
    });
    element.replaceWith(frag);

    async function append(data) {
      let iterator = data[element.dataset.prop];
      let values = [];
      for await (let value of iterator) {
        values = values.concat([value]);
        frag.update({
          values
        });
      }
    }

    append(data);
    return function() {
      frag.update({ values: [] });
      append(data);
    };
  }

  let vm = {
    colors: getColors(),

    stream: streamDirective,

    refresh() {
      vm.colors = getColors();
      frag.update(vm);
    }
  };

  let frag = template.createInstance(vm);

  return frag;
}