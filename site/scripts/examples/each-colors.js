import { stamp } from '../grim.js';

const templateEl = document.createElement('template');
templateEl.innerHTML = /* html */ `
  <h1>Favorite colors</h1>
  <ul>
    <template $each="colors">
      <li>{{item.label}}</li>
    </template>
  </ul>
`;

export default function() {
  let template = stamp(templateEl);

  let frag = template.createInstance({
    colors: [
      { id: 1, label: 'Red' },
      { id: 2, label: 'Blue' },
      { id: 3, label: 'Yellow' }
    ]
  });

  return frag;
}