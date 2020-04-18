---
layout: syntax.njk
title: Directives
tags: syntax
permalink: syntax/directive.html
---

# Directives

A __directive__ is denoted with the `$` character and placed on elements. It allows passing a function that takes the element and the encompassing data.

Directives are powerful ways to extend the capabilities of Grim. The [$each](./list.html) and [$if](./conditional.html) directives are two built-in examples.

Below is a directive called `$stream` that takes an async iterator and appends items to a list. It does this by creating an inner [$each](./list.html) template that gets updated every time a new item is streamed in. This is a naive implementation but shows the low-level capabilities provided by directives.

<live-example src="./examples/colors-stream.js">

{% raw %}
```html
<template id="example">
  <h1>Favorite colors</h1>

  <button @click="refresh">Refresh</button>
  <ul>
    <template $stream data-prop="colors">
      <li>{{item.label}}</li>
    </template>
  </ul>
</template>

<script type="module">
  import { stamp } from 'https://cdn.pika.dev/grim2';

  let template = stamp(document.querySelector('#example'));

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

  document.body.append(frag);
</script>
```
{% endraw %}

</live-example>

## Signature

`function(element, data) -> function(data)`

### element

The first argument is the __element__ that the directive is attached to.

### data

The second argument is the __data__ at the scope in which the directive is used. If the directive is used in the outer most template then this is the data object passed into `createInstance` or `update`. If inside of an [$each](./list.html) then it is the item within the list.

### Return value

The return value is a function that takes a `data` object. This function is used for updates.