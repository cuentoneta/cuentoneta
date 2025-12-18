import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
export default {
	stories: ['../src/app/**/*.stories.mdx', '../src/app/**/*.stories.@(js|jsx|ts|tsx)'],
	styles: [],
	addons: [getAbsolutePath('@storybook/addon-docs')],
	framework: {
		name: getAbsolutePath('@storybook/angular'),
		options: {},
	},
	docs: {},
	staticDirs: [{ from: '../src/assets', to: '/assets' }],
};

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs

function getAbsolutePath(value) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
