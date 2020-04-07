---
layout: page.njk
title: Grim
tags:
  - api
  - package
permalink: packages/grim.html
---

# Grim

__Grim__ is a declarative templating library for JavaScript projects. See the [syntax](../syntax.html) page for information on the syntax used inside of templates.

## Install

The easiest way is to use a CDN such as [unpkg](https://unpkg.com) and import directly from your browser like so:

```html
<script type="module">
  import { stamp } from 'https://unpkg.com/grim2@1.0.0/grim.js';
</script>
```

With [npm](https://www.npmjs.com/) you can install the `grim2` package:

```bash
npm install grim2 --save
```

If using the npm workflow I suggest pairing it with [Snowpack] which allows you to work locally while still using browser modules.

```bash
npx snowpack
```

After you run that you can import Grim via `web_modules/grim2.js` like so:

```html
<script type="module">
  import { stamp } from '/web_modules/grim2.js';
</script>
```

## API

The Grim package has one named export, `stamp`. 

### stamp

__stamp__ is a function that takes a [template](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) element that contains bindings (such as the handlebar tags {% raw %}`{{}}`{% endraw %}). It finds all of the bindings in the template and remembers where they are, returning a `Template` object.

```js
let templateEl = document.querySelector('template');
let template = stamp(templateEl);
```

### Template

A __Template__ object contains the method `createInstance` which is used to create new instances of the template.

#### template.createInstance(data)

Use __createInstance__ to create a [fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) that can be inserted into DOM. This fragment is __live__, meaning you can update the value of any bindings contained within.

```js
let templateEl = document.querySelector('template');
let template = stamp(templateEl);

let frag = template.createInstance({
  name: 'Reaper'
});

document.body.append(frag);
```

### Fragment

The document fragment returned by `createInstance` is different from normal document fragments created via APIs such as [document.createDocumentFragment()](https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment), because it has an __update__ method.

#### fragment.update(data)

All of the bindings inside of the template are *live*, that is they can be updated. Initially the values are set via the object passed into `createInstance`. You can update the template to reflect new values by calling `update(data)`.

The object you pass into `update` can be the same object as passed into `createInstance` or a different object. It can be a different object every time you call it; Grim does not retain the object, it only checks values on it.

```js
let templateEl = document.querySelector('template');
let template = stamp(templateEl);

let frag = template.createInstance({
  name: 'Reaper'
});

document.body.append(frag);

frag.update({
  name: 'Lady Death'
});
```