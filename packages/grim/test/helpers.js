export function createTemplate(str) {
  let t = document.createElement('template');
  t.innerHTML = str;
  return t;
}