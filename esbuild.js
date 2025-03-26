const esbuild = require("esbuild");
const path = require('path');

const isWatch = process.argv.includes('--watch');
const isProduction = process.argv.includes('--production');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
	entryPoints: ['src/extension.ts'],
	bundle: true,
	outfile: 'out/extension.js',
	external: ['vscode'],
	format: 'cjs',
	platform: 'node',
	target: 'node14',
	sourcemap: !isProduction,
	minify: isProduction,
	plugins: [
		esbuildProblemMatcherPlugin,
	],
};

/** @type {import('esbuild').BuildOptions} */
const webviewConfig = {
	entryPoints: ['src/webview/index.tsx'],
	bundle: true,
	outfile: 'out/webview.js',
	format: 'iife',
	platform: 'browser',
	target: 'es2020',
	sourcemap: !isProduction,
	minify: isProduction,
	define: {
		'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
	},
	loader: {
		'.tsx': 'tsx',
		'.ts': 'ts',
	},
	jsx: 'automatic',
	tsconfig: 'tsconfig.json',
	resolveExtensions: ['.tsx', '.ts', '.js'],
};

async function build() {
	try {
		if (isWatch) {
			const extensionCtx = await esbuild.context(extensionConfig);
			const webviewCtx = await esbuild.context(webviewConfig);
			
			await Promise.all([
				extensionCtx.watch(),
				webviewCtx.watch()
			]);
		} else {
			await Promise.all([
				esbuild.build(extensionConfig),
				esbuild.build(webviewConfig)
			]);
		}
	} catch (error) {
		console.error('Build failed:', error);
		process.exit(1);
	}
}

build();
