import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

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
	// Resolución nativa de los `paths` del tsconfig (@models, @mocks, @components, …), en lugar de
	// `vite-tsconfig-paths`: el plugin descubre proyectos recorriendo el árbol, y bajo
	// `.claude/worktrees/` hay copias enteras del repo. Basta con que el tsconfig de una de ellas no
	// le parsee para que aborte y deje de resolver alias en TODO el catálogo — sin más síntoma que
	// stories que no cargan. El plugin de Analog que compila Angular lo aporta el framework
	// @storybook/angular-vite.
	viteFinal: async (config) => {
		config.resolve = { ...config.resolve, tsconfigPaths: true };
		return config;
	},
};

function getAbsolutePath(value) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
