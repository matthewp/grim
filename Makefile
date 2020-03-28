ELEVENTY=node_modules/.bin/eleventy

site:
	$(ELEVENTY) --input=site --config=site/.eleventy.js
.PHONY: site