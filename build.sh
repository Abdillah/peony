#!/usr/bin/env bash

# alpinejs
pnpm exec esbuild --format=esm --bundle --external:@vue/reactivity --define:ALPINE_VERSION='"3.14.1"' node_modules/alpinejs/src/index.js > mod/alpinejs/index.js
pnpm exec esbuild --format=esm --bundle node_modules/@vue/reactivity/dist/reactivity.esm-browser.js > mod/@vue/reactivity/index.js
