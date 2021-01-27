const {install} = require('esinstall');

async function run() {
  await install([
    'grim2',
    'lit-element/lib/updating-element.js'
  ]);
}

run().catch(err => console.error(err));