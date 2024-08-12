function build(options) {
    options.define || (options.define = {})

    return require('esbuild').build({
        logLevel: process.argv.includes('--watch') ? 'info' : 'warning',
        // watch: process.argv.includes('--watch'),
        // external: ['alpinejs'],
        ...options,
    }).catch(() => process.exit(1))
}

const pkgs = require('./package.json');
const modules = {
  'alpinejs': {
    'define': {
      'ALPINE_VERSION': `'${pkgs.dependencies['alpinejs'].replace(/[\^]/, '')}'`
    },
    'entryPoints': ['src/index.js'],
  },
  '@vue/reactivity': {
    'entryPoints': ['dist/reactivity.esm-browser.js'],
  },
};

const isProduction = process.argv.includes('--production');
const externals = Object.keys(modules);

for (const k in modules) {
  const module = modules[k]
  build(Object.assign(module, {
    format: 'esm',
    bundle: true,
    external: externals,
    outfile: `mod/${k}/index${isProduction ? '.min' : ''}.js`,
    entryPoints: module.entryPoints.map((ep) => `node_modules/${k}/${ep}`),
  }));
}
