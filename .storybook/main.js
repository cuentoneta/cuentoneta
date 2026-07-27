import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default {
	stories: ['../src/app/**/*.stories.mdx', '../src/app/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [getAbsolutePath('@storybook/addon-docs')],
	framework: {
		name: getAbsolutePath('@storybook/angular-vite'),
		// No usamos compodoc para autodocs; su binario no está instalado.
		options: { compodoc: false },
	},
	docs: {},
	staticDirs: [{ from: '../src/assets', to: '/assets' }],
	// Vite no resuelve los `paths` del tsconfig por sí solo: el plugin mapea @models, @utils,
	// @components, @mocks, @test-utils (mismo patrón que vitest.config.ts). El plugin de Analog
	// que compila Angular ya lo aporta el framework @storybook/angular-vite.
	viteFinal: async (config) => {
		config.plugins = [...(config.plugins ?? []), tsconfigPaths()];
		return config;
	},
};

function getAbsolutePath(value) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
