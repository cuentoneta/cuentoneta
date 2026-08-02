import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Alias de Vite derivados de los `paths` del tsconfig raíz, para que no haya una segunda lista que
 * mantener en sync.
 *
 * Se declaran a mano en lugar de usar `vite-tsconfig-paths` (el patrón de `vitest.config.ts`):
 * librado a su descubrimiento, el plugin toma el tsconfig de este directorio —que solo incluye las
 * stories— y apuntarlo al raíz tampoco alcanza, porque ese declara los paths con `include` vacío y
 * ningún archivo entra en su alcance. El resultado era que ninguna story que importara `@mocks`,
 * `@models` o `@components` cargaba en el dev server, aunque la build estática sí resolviera.
 */
function tsconfigPathAliases() {
	const { compilerOptions } = JSON.parse(readFileSync(resolve(workspaceRoot, 'tsconfig.json'), 'utf8'));

	return Object.entries(compilerOptions.paths).map(([alias, [target]]) =>
		alias.endsWith('/*')
			? { find: new RegExp(`^${alias.slice(0, -1)}`), replacement: `${resolve(workspaceRoot, target.slice(0, -1))}/` }
			: { find: alias, replacement: resolve(workspaceRoot, target) },
	);
}

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
	// El plugin de Analog que compila Angular ya lo aporta el framework @storybook/angular-vite.
	viteFinal: async (config) => {
		config.resolve = { ...config.resolve, alias: [...(config.resolve?.alias ?? []), ...tsconfigPathAliases()] };
		return config;
	},
};

function getAbsolutePath(value) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
