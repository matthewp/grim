import { stamp } from '../grim.js';

const templateEl = document.createElement('template');
templateEl.innerHTML = /* html */ `
  <style>progress { background: black; }</style>
  <progress .value="value" max="100">
`;

export default function() {
  let template = stamp(templateEl);

  let frag = template.createInstance({
    value: 20
  });

  return frag;
}