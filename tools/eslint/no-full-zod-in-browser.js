/**
 * Prohíbe que la librería zod completa entre al bundle del navegador. En el frontend zod se importa
 * como `import * as z from 'zod/mini'`; cualquier otra forma arrastra el paquete entero.
 *
 * Dos violaciones distintas, porque son dos maneras distintas de romper lo mismo:
 * - **Un specifier que no tree-shakea:** la raíz `zod` y sus subpaths versionados (`zod/v4`, `zod/v3`,
 *   `zod/locales`) exponen el namespace completo.
 * - **La forma del import sobre una variante que sí tree-shakea:** `zod/mini` reexporta un objeto
 *   namespace, así que traer su `z` por nombre lo materializa y devuelve la librería entera. Esa
 *   variante tipa igual, pasa los tests y hasta reduce el tamaño frente a la raíz, así que se ve como
 *   una mejora mientras deshace el objetivo.
 *
 * Va como regla propia y no como `no-restricted-imports` + `no-restricted-syntax` porque el scope que
 * necesita —todo lo que el navegador descarga— se solapa con varios bloques que ya declaran esas dos
 * reglas, y en flat config un bloque posterior **reemplaza** su array en vez de mergearlo: cubrir el
 * scope correcto con reglas core costaba recomponer a mano las restricciones de specs, de páginas y de
 * tipos de Sanity, y perder cualquiera de ellas no rompe nada — simplemente deja de proteger. El
 * enforcement y su porqué: `typescript.md`.
 */

// Specifiers que traen el namespace completo. Los subpaths se comparan por prefijo, así que `zod/v4`
// cubre también lo que cuelga de él.
const FULL_PACKAGE_SPECIFIER = 'zod';
const FULL_PACKAGE_SUBPATHS = ['zod/v3', 'zod/v4', 'zod/locales'];

// La variante tree-shakable y sus alias. Solo sirven importadas como namespace.
const TREE_SHAKABLE_SPECIFIERS = ['zod/mini', 'zod/v4-mini', 'zod/v4/mini'];

const bringsFullPackage = (source) =>
	source === FULL_PACKAGE_SPECIFIER ||
	FULL_PACKAGE_SUBPATHS.some((subpath) => source === subpath || source.startsWith(`${subpath}/`));

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Prohíbe importar la librería zod completa en el código que viaja al navegador.',
		},
		schema: [],
		messages: {
			fullPackage:
				'`{{source}}` trae la librería zod completa al bundle del navegador. Usá `import * as z from "zod/mini"`. Los schemas del backend (src/api/**) sí usan zod clásico.',
			namedNamespace:
				'Importar `{{name}}` por nombre desde `{{source}}` anula el tree-shaking: el specifier reexporta un objeto namespace y traerlo así lo materializa entero. Usá `import * as z from "{{source}}"`.',
		},
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				if (typeof source !== 'string') {
					return;
				}

				// Las variantes tree-shakables se resuelven primero porque una de ellas (`zod/v4/mini`) cuelga
				// de un subpath prohibido, y el chequeo por prefijo la reportaría como paquete completo.
				if (!TREE_SHAKABLE_SPECIFIERS.includes(source)) {
					if (bringsFullPackage(source)) {
						context.report({ node, messageId: 'fullPackage', data: { source } });
					}
					return;
				}

				// Un `import * as z` es un ImportNamespaceSpecifier y no entra acá: es justamente la forma
				// correcta. Solo se reportan los nombrados, que son los que materializan el namespace.
				for (const specifier of node.specifiers) {
					if (specifier.type === 'ImportSpecifier') {
						context.report({
							node: specifier,
							messageId: 'namedNamespace',
							data: { source, name: specifier.imported.name },
						});
					}
				}
			},
		};
	},
};
