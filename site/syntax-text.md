---
layout: page.njk
title: Text Binding
tags: syntax
permalink: syntax-text.html
---

Text is bound using the double curly notation that is common with many templating languages, {% raw %}`{{}}`{% endraw %}.

Text can appear as children of HTML tags, or directly inside of the `<template>` element itself.

{% raw %}
```html
<template id="my-template">
  <h1>Welcome, {{username}}</h1>
</template>
```
{% endraw %}