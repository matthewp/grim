---
layout: home.njk
title: Grim - Simple HTML Templating in 2kB
shortTitle: Home
tags: page
date: 2020-01-01
---

__Grim__ takes the innovations in [lit-html](https://lit-html.polymer-project.org/) and brings them to HTML. Fast, small, and simple to understand, Grim is the templating choice for websites.

Grim is intentionally low-level and is meant to work with a variety of state management solutions, from familiar ones like class-based components, hooks, [Redux](https://redux.js.org/) and more, to emerging solutions such as [Finite State Machine](https://brilliant.org/wiki/finite-state-machines/) libraries.

<section id="pkg-grim">
<div class="pkg-content">

## Grim

__[Grim](./packages/grim.html)__ allows writing templates in HTML. Instances of templates are [DocumentFragments](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) that have a special `update` method.

</div>

{% raw %}
```html
<template id="hw">
  <h1>Hello {{name}}!</h1>
</template>

<script type="module">
  import { stamp } from 'https://cdn.pika.dev/grim2';

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

<section id="pkg-grim-element">
<div class="pkg-content">

## GrimElement

__[GrimElement](./packages/grim-element.html)__ is a [custom element](https://developers.google.com/web/fundamentals/web-components/customelements) base class to be used in conjunction with Grim templates.

GrimElement is based on [LitElement](https://lit-element.polymer-project.org/) and in fact uses some of its code under the hood. If you are familiar with configuring properties with LitElement, it is exactly the same in GrimElement.

</div>

{% raw %}
```html
<hello-world></hello-world>

<template id="hw">
  <h1>Hello {{name}}!</h1>
</template>

<script type="module">
  import { GrimElement } from 'https://cdn.pika.dev/grim-element';

  class HelloWorld extends GrimElement {
    static template = document.querySelector('#hw');

    static properties = {
      name: { type: String }
    };
  }
  customElements.define('hello-world', HelloWorld);

  let helloWorld = document.querySelector('hello-world');
  helloWorld.name = 'New York';
</script>
```
{% endraw %}

</section>

## Flexibility

The core Grim package is meant to be low-level so that it can be used with many state management solutions. It provides a simple model:

* Templates are defined in HTML using familiar handlebar syntax, removing the need to clutter your JavaScript with template definitions.
* Instances of a template create DocumentFragments which can be inserted into any element. The fragment retains an `update` method that can be called with data to update all of its bindings. There is *no* automatic data binding, you must call update.

These two factors means it works will with advanced state management solutions like [RxJS](https://rxjs-dev.firebaseapp.com/), and Finite State Machine libraries.

Here's an example of using [Robot](https://thisrobot.life/) to manage a timer that is kept up to date with Grim:

<live-example src="./examples/timer.js">

{% raw %}
```js
<template id="timer">
  Seconds: <strong>{{seconds}}</strong>
</template>

<script type="module">
  import { stamp } from 'https://cdn.pika.dev/grim2';
  import {
    createMachine,
    interpret,
    immediate,
    invoke,
    reduce,
    state,
    transition
  } from 'https://cdn.pika.dev/robot3';

  function waitASecond() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  const machine = createMachine({
    tick: invoke(waitASecond,
      transition('done', 'tock')
    ),
    tock: state(
      immediate('tick',
        reduce(ctx => ({
          seconds: ctx.seconds + 1
        }))
      )
    )
  }, () => ({ seconds: 0 }));

  let template = stamp(document.querySelector('#timer'));

  let service = interpret(machine, () => {
    frag.update(service.context);
  })

  let frag = template.createInstance(service.context);

  document.body.append(frag);
</script>
```
{% endraw %}

</live-example>