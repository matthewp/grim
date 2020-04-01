ELEVENTY=node_modules/.bin/eleventy

site:
	$(ELEVENTY) --input=site --config=site/.eleventy.js
.PHONY: site

deploy:
	aws s3 sync _site s3://withthereaper.dance --delete
.PHONY: deploy