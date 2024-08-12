const fs = require('node:fs');

async function build(options) {
    options.define || (options.define = {})

    const ctx = await require('esbuild').context({
        logLevel: process.argv.includes('--watch') ? 'info' : 'warning',
        write: false,
        ...options,
    });

    const result = await ctx.rebuild();
    if (result.outputFiles) {
        for (const f of result.outputFiles) {
            fs.writeFileSync(f.path, f.contents);
        }
        console.log(`✨ Build '${options.outfile}' succeeded.`);
    }

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
        minify: isProduction,
        sourcemap: !isProduction,
        outfile: `mod/${k}/index${isProduction ? '.min' : ''}.js`,
        entryPoints: module.entryPoints.map((ep) => `node_modules/${k}/${ep}`),
    }));
    promises.push(p);
}

Promise.all(promises)
.then((results) => {
    results.forEach((ctx) => ctx.dispose());
    console.log('👋🏻 Bye..')
    process.exit(0);
})
