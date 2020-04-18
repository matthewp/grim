import { stamp } from '../grim.js';

const templateEl = document.createElement('template');
templateEl.innerHTML = /* html */ `
  <div class="clicks-demo">
    <style>
      .clicks-demo button {
        font-size: 110%;
        border: none;
        background: salmon;
        padding: .5rem;
      }
    </style>

    Clicks: <strong>{{clicks}}</strong>

    <div>
      <button @click="increment">Increment</button>
      <button @click="decrement">Decrement</button>
    </div>
  </div>
`;

export default function() {
  let template = stamp(templateEl);

  let vm = {
    clicks: 0,

    increment() {
      vm.clicks++;
      frag.update(vm);
    },

    decrement() {
      vm.clicks--;
      frag.update(vm);
    }
  };

  let frag = template.createInstance(vm);
  return frag;
}