---
layout: page.njk
title: Property Binding
tags: syntax
permalink: syntax-property.html
---

Properties are setting using attributes that start with a dot `.`. This is meant to mirror setting properties in JavaScript: `person.name = 'Reaper';`.

```html
<template id="person">
  <input type="number" .valueAsNumber="{{age}}">
</template>

<script type="module">
  import { stamp } from '/web_modules/grim2.js';

  let template = stamp(document.querySelector('#person'));
  let frag = template.createInstance({
    age: 13
  });

  let input = frag.querySelector('input');
  console.log(input.value); // "13"
</script>
```

Properties can be set on any element, but are particularly useful when working with [custom elements](https://developers.google.com/web/fundamentals/web-components/customelements) that you are passing data down to.