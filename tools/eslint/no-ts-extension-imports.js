/**
 * Prohíbe importar un módulo relativo con su extensión `.ts` / `.tsx`, salvo en la cadena del hook de
 * edición.
 *
 * Esa cadena corre con `node` puro, sin loader, y ESM le exige la extensión. Para que TypeScript la
 * acepte, `tsconfig.typecheck.json` y `tsconfig.spec.json` declaran `allowImportingTsExtensions`, y esa
 * habilitación alcanza a todo lo que esos dos programas incluyen — `src/`, `e2e/` y `resources/`, además
 * de `scripts/`. Sin esta regla, la forma queda disponible en todo el repo por una necesidad de dos
 * archivos, y el compilador no tiene cómo distinguirlos.
 *
 * La allowlist va por ruta y no por patrón, igual que las del propio hook y las del gate: sumar una
 * entrada tiene que verse en el diff. Si la cadena crece, la entrada nueva es una decisión, no un efecto.
 *
 * Va como regla propia y no como `no-restricted-imports` porque el scope que necesita es todo el árbol,
 * que se solapa con varios bloques que ya declaran esa regla; en flat config un bloque posterior
 * **reemplaza** su array en vez de mergearlo. El enforcement y su porqué: `typescript.md`.
 */

import { sep } from 'node:path';

/** Los módulos que corren bajo `node` puro y por eso importan con extensión. */
const HOOK_CHAIN = ['scripts/block-issue-refs-in-comments.ts', 'scripts/block-issue-refs-in-comments.helpers.ts'];

const TS_EXTENSION = /\.tsx?$/;

const isRelative = (source) => source.startsWith('./') || source.startsWith('../');

const isHookChain = (filename) => HOOK_CHAIN.some((allowed) => filename.endsWith(allowed.split('/').join(sep)));

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Prohíbe importar módulos relativos con extensión .ts/.tsx fuera de la cadena del hook.',
		},
		schema: [],
		messages: {
			tsExtension:
				'`{{source}}` importa con extensión `.ts`. La forma existe solo para la cadena del hook de edición, que corre con `node` puro; en el resto del repo el import va sin extensión.',
		},
	},
	create(context) {
		if (isHookChain(context.filename)) {
			return {};
		}

		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				if (typeof source === 'string' && isRelative(source) && TS_EXTENSION.test(source)) {
					context.report({ node: node.source, messageId: 'tsExtension', data: { source } });
				}
			},
		};
	},
};
