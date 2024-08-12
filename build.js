async function build(options) {
    options.define || (options.define = {})

    const ctx = await require('esbuild').context({
        logLevel: process.argv.includes('--watch') ? 'info' : 'warning',
        ...options,
    });

    const result = await ctx.rebuild();
    console.log(`✨ Build '${options.outfile}' succeeded.`);

    if (process.argv.includes('--watch')) {
        // Enable watch
        console.log(`👀 Watching '${options.outfile}'..`);
        ctx.watch();
    }

    return ctx;
}

const pkgs = require('./package.json');
const modules = {
    'alpinejs': {
        'define': {
            'ALPINE_VERSION': `'${pkgs.dependencies['alpinejs'].replace(/[\^]/, '')}'`
        },
        'entryPoints': [ 'src/index.js' ],
    },
    '@vue/reactivity': {
        'entryPoints': [ 'dist/reactivity.esm-browser.js' ],
    },
};

const isProduction = process.argv.includes('--production');
const externals = Object.keys(modules);

const promises = [];
for (const k in modules) {
    const module = modules[k]
    const p = build(Object.assign(module, {
        format: 'esm',
        bundle: true,
        external: externals,
        outfile: `mod/${k}/index${isProduction ? '.min' : ''}.js`,
        entryPoints: module.entryPoints.map((ep) => `node_modules/${k}/${ep}`),
    }));
    promises.push(p);
}

Promise.all(promises)
.then(() => process.exit(0))
