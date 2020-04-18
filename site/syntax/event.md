---
layout: syntax.njk
title: Event Binding
tags: syntax
permalink: syntax/event.html
---

# Events

Events are set using attributes that start with an `@` symbol. This is the same as binding to [events in lit-html](https://lit-html.polymer-project.org/guide/writing-templates#add-event-listeners).

<live-example src="./examples/clicks.js">

{% raw %}
```html
<template id="clicks">
  Clicks: <strong>{{clicks}}</strong>

  <div>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script type="module">
  import { stamp } from 'https://www.pika.dev/cdn';

  let template = stamp(document.querySelector('#clicks'));

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
  document.body.append(frag);
</script>
```
{% endraw %}

</live-example>
