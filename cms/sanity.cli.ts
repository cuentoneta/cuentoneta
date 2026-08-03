import { defineCliConfig } from 'sanity/cli';
import path from 'node:path';

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
		dataset: process.env.SANITY_STUDIO_DATASET,
	},
	// Sin appId fijo, `sanity deploy` pide seleccionar la aplicación por prompt
	// interactivo y falla en CI (entorno no interactivo).
	deployment: {
		appId: '250c71d418c638b6f4236e23',
	},
	typegen: {
		path: '../src/api/**/*.{ts,tsx,js,jsx}',
		schema: 'schema.json',
		generates: '../src/sanity/types.ts',
	},
	// cms es un proyecto pnpm standalone: su build bundlea con Vite y no resuelve los `paths` del
	// tsconfig raíz. Se registran los alias del kernel compartido para importarlo por shortpath en vez
	// de rutas relativas ../../src/*. __dirname es cms/ (Sanity carga este config con su loader CJS),
	// así que resuelven a <repo>/src/*.
	vite: (config) => {
		const kernelAliases = {
			'@models': path.resolve(__dirname, '../src/models'),
			'@utils': path.resolve(__dirname, '../src/utils'),
		};
		const existingAlias = config.resolve?.alias;
		// resolve.alias admite forma objeto o array (readonly Alias[]): se mergea según la que Sanity
		// provea para no corromperla — spread de un array dentro de un objeto generaría claves numéricas.
		const alias = Array.isArray(existingAlias)
			? [...existingAlias, ...Object.entries(kernelAliases).map(([find, replacement]) => ({ find, replacement }))]
			: { ...existingAlias, ...kernelAliases };
		return {
			...config,
			resolve: { ...config.resolve, alias },
		};
	},
});
