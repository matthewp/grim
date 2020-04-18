---
layout: syntax.njk
title: Lists
tags: syntax
permalink: syntax/list.html
---

# Lists

In Grim lists (such as arrays) are iterated over using a `<template>` and the `$each` [directive](./directive.html). Lists can be iterated both with keys and without keys.

<live-example src="./examples/each-colors.js">

{% raw %}
```html
<template id="colors">
  <h1>Favorite colors</h1>
  <ul>
    <template $each="colors">
      <li>{{item.label}}</li>
    </template>
  </ul>
</template>

<script type="module">
  import { stamp } from 'https://cdn.pika.dev/grim2';

  let template = stamp(document.querySelector('#colors'));
  let frag = template.createInstance({
    colors: [
      { id: 1, label: 'Red' },
      { id: 2, label: 'Blue' },
      { id: 3, label: 'Yellow' }
    ]
  });

  document.body.append(frag);
</script>
```
{% endraw %}

</live-example>

Within the scope of the `$each` `template` is a special property `item` that is the current item within the list.

The outer most template's data is also within the scope. Below the `title` property is on the outer most template's data but is used within the `$each` template.

```html
<template id="colors">
  <ul>
    <template $each="colors">
      <li>{{title}} - {{item.label}}</li>
    </template>
  </ul>
</template>

<script type="module">
  import { stamp } from 'https://cdn.pika.dev/grim2';

  let template = stamp(document.querySelector('#colors'));
  let frag = template.createInstance({
    title: 'Favorite Color',
    colors: [
      { id: 1, label: 'Red' },
      { id: 2, label: 'Blue' },
      { id: 3, label: 'Yellow' }
    ]
  });

  document.body.append(frag);
</script>
```

## Keyed

Providing a key for items within your list will greatly improve performance when dealing with large lists that are updated in non-trivial ways. An example is a data table where items in the table are resorted, or items might be added in the middle.

To provide a key add the `data-key` property. In the above example `id` is the property, so it would be:

{% raw %}
```html
<template $each="colors" data-key="id">
  <li>{{item.label}}</li>
</template>
```
{% endraw %}