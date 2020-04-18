---
layout: syntax.njk
title: Property Binding
tags: syntax
permalink: syntax/property.html
---

Properties are setting using attributes that start with a dot `.`. This is meant to mirror setting properties in JavaScript: `person.name = 'Reaper';`.

<live-example src="./examples/progress-prop.js">

```html
<template id="progress">
  <progress .value="value" max="100">
</template>

<script type="module">
  import { stamp } from 'https://cdn.pika.dev/grim2';

  let template = stamp(document.querySelector('#progress'));
  let frag = template.createInstance({
    value: 20
  });

  let progress = frag.querySelector('progress');
  assert.equal(progress.value, 20);
</script>
```

</live-example>

Properties can be set on any element, but are particularly useful when working with [custom elements](https://developers.google.com/web/fundamentals/web-components/customelements) that you are passing data down to.