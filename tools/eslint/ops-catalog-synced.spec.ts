import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';

import { OPS_TASKS } from '../../scripts/ops/registry';
import rule from './ops-catalog-synced.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

const REGISTRY_FILE = 'scripts/ops/registry.ts';

// Los casos válidos se arman con el registro real, no con una copia de sus tareas: la copia quedaría
// desactualizada y el spec afirmaría contra un catálogo que ya no es el que la regla compara.
const taskIds = Object.keys(OPS_TASKS);

// Una tarea del catálogo: el caso de la fila huérfana la omite del registro.
const OMITTED_TASK = 'config';

const registryCode = (ids: readonly string[]) =>
	`const OPS_TASKS = Object.freeze({ ${ids.map((id) => `'${id}': {}`).join(', ')} } as const satisfies Record<string, unknown>);`;

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al nivel superior del
// archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('ops-catalog-synced', rule, {
	valid: [
		// El registro real, documentado en el catálogo del repo.
		{ filename: REGISTRY_FILE, code: registryCode(taskIds) },
		// Sin `Object.freeze`: la declaración se lee igual.
		{ filename: REGISTRY_FILE, code: `const OPS_TASKS = { ${taskIds.map((id) => `'${id}': {}`).join(', ')} };` },
		// Fuera del registro la regla no mira nada.
		{ filename: 'scripts/ops/dispatch.ts', code: registryCode(['tarea:inexistente']) },
	],
	invalid: [
		{
			filename: REGISTRY_FILE,
			code: registryCode([...taskIds, 'tarea:inexistente']),
			errors: [{ messageId: 'undocumented', data: { id: 'tarea:inexistente' } }],
		},
		{
			filename: REGISTRY_FILE,
			code: registryCode(taskIds.filter((id) => id !== OMITTED_TASK)),
			errors: [{ messageId: 'stale', data: { id: OMITTED_TASK } }],
		},
		{
			filename: REGISTRY_FILE,
			code: 'const OTRAS_TAREAS = {};',
			errors: [{ messageId: 'unreadable' }],
		},
	],
});
