import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import { join } from 'node:path';

// REASON: la regla es un `.js` sin tipos propios; el RuleTester solo necesita el módulo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rule from './no-ts-extension-imports.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

// La allowlist compara sufijos de ruta usando el separador del sistema, así que los
// filenames de los casos se arman con `join` — con barras literales no matchearían en
// Windows y la exención pasaría inadvertida.
const hookChainFile = (name: string) => join('scripts', name);

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al
// nivel superior del archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('no-ts-extension-imports', rule, {
	valid: [
		{ code: `import { x } from './a';`, filename: 'src/a.ts' },
		// Un paquete no es un import relativo, aunque termine en algo parecido.
		{ code: `import { x } from 'pkg/a.ts';`, filename: 'src/a.ts' },
		// La allowlist por ruta: los módulos de la cadena del hook sí importan con extensión.
		{ code: `import { x } from './a.ts';`, filename: hookChainFile('block-issue-refs-in-comments.ts') },
		{ code: `import { x } from './a.ts';`, filename: hookChainFile('block-issue-refs-in-comments.helpers.ts') },
	],
	invalid: [
		{ code: `import { x } from './a.ts';`, filename: 'src/a.ts', errors: [{ messageId: 'tsExtension' }] },
		{ code: `import { x } from '../b.tsx';`, filename: 'src/a.ts', errors: [{ messageId: 'tsExtension' }] },
		// La exención es del archivo que importa, no del nombre del módulo importado: un
		// archivo cualquiera no se ampara en que el destino se llame como uno de la cadena.
		{
			code: `import { x } from './block-issue-refs-in-comments.ts';`,
			filename: hookChainFile('otro.ts'),
			errors: [{ messageId: 'tsExtension' }],
		},
	],
});
