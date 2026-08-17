import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';

import rule from './no-full-zod-in-browser.js';

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

// `RuleTester.run` declara su propia suite con `describe`/`it`, así que se invoca al nivel superior del
// archivo: anidarlo dentro de un `it` es un error de Vitest.
ruleTester.run('no-full-zod-in-browser', rule, {
	valid: [
		// La única forma que tree-shakea, y sus alias.
		"import * as z from 'zod/mini';",
		"import * as z from 'zod/v4-mini';",
		"import * as z from 'zod/v4/mini';",
		// Un nombre distinto de `z` no cambia nada: lo que importa es la forma, no el identificador.
		"import * as esquemas from 'zod/mini';",
		// Paquetes ajenos que empiezan igual no se tocan.
		"import { zodResponseFormat } from 'zod-to-json-schema';",
		"import { zValidator } from '@hono/zod-validator';",
	],
	invalid: [
		{
			code: "import { z } from 'zod';",
			errors: [{ messageId: 'fullPackage' }],
		},
		{
			code: "import * as z from 'zod';",
			errors: [{ messageId: 'fullPackage' }],
		},
		// Los subpaths versionados traen el namespace completo igual que la raíz.
		{
			code: "import * as z from 'zod/v4';",
			errors: [{ messageId: 'fullPackage' }],
		},
		{
			code: "import * as z from 'zod/v3';",
			errors: [{ messageId: 'fullPackage' }],
		},
		{
			code: "import es from 'zod/v4/locales';",
			errors: [{ messageId: 'fullPackage' }],
		},
		// El caso que motiva la regla: tipa igual, pasa los tests y devuelve la librería entera.
		{
			code: "import { z } from 'zod/mini';",
			errors: [{ messageId: 'namedNamespace' }],
		},
		{
			code: "import { z as esquemas } from 'zod/mini';",
			errors: [{ messageId: 'namedNamespace' }],
		},
		// Cada specifier nombrado se reporta por separado, para que el fix sea por sitio.
		{
			code: "import { object, string } from 'zod/mini';",
			errors: [{ messageId: 'namedNamespace' }, { messageId: 'namedNamespace' }],
		},
	],
});
