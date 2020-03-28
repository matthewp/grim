---
layout: page.njk
title: Grim - simple HTML templating in 2kB
id: home
shortTitle: Home
tags: page
---

__Grim__ takes the innovations in [lit-html](https://lit-html.polymer-project.org/) and brings them to HTML. Fast, small, and simple to understand, Grim is the templating choice for websites.

<section id="pkg-grim">

## Grim

__Grim__ allows writing templates in HTML. Instances of templates are [DocumentFragments](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) that have a special `update` method.

{% raw %}
```html
<template id="hw">
  <h1>Hello {{name}}!</h1>
</template>

<script type="module">
  import { stamp } from '/web_modules/grim/grim.js';

  let template = stamp(document.querySelector('#hw'));
  
  let frag = template.createInstance({
    name: 'World'
  });

  document.body.append(frag);

  frag.update({ name: 'New York' });
</script>
```
{% endraw %}

</section>

## GrimElement

__GrimElement__ is a [custom element](https://developers.google.com/web/fundamentals/web-components/customelements) base class to be used in conjunction with Grim templates.

{% raw %}
```html
<template id="hw">
  <h1>Hello {{name}}!</h1>
</template>

<script type="module">
  import { GrimElement } from '/web_modules/grim-element/grim-element.js';

  class HelloWorld extends GrimElement {
    static template = template;

    static properties = {
      name: { type: String }
    };
  }
  customElements.define('hell-world', HelloWorld);

  let helloWorld = document.querySelector('hello-world');
  helloWorld.name = 'New York';
</script>
```
{% endraw %}