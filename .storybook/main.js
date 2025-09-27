module.exports = {
	stories: ['../src/app/**/*.stories.mdx', '../src/app/**/*.stories.@(js|jsx|ts|tsx)'],
	styles: [],
	addons: [
		'@storybook/addon-docs',
		{
			name: '@storybook/addon-styling-webpack',
			options: {
				postCss: true,
			},
		},
	],
	framework: {
		name: '@storybook/angular',
		options: {},
	},
	docs: {},
	staticDirs: ['../src/assets'],
};

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
