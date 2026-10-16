import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Cada tsconfig que compila código del repo. Los hijos heredan la bandera de `tsconfig.json`, pero un
// `false` en cualquiera de ellos la apagaría solo para ese programa, y el gate `typecheck` seguiría
// verde: este es el único lugar donde esa regresión se ve.
const TSCONFIGS = [
	'tsconfig.json',
	'tsconfig.app.json',
	'tsconfig.spec.json',
	'tsconfig.editor.json',
	'tsconfig.server.json',
	'tsconfig.typecheck.json',
	'.storybook/tsconfig.json',
	'cms/tsconfig.json',
	'cms/tsconfig.typecheck.json',
	'tools/eslint/tsconfig.json',
];

function resolveOptions(configPath: string): ts.CompilerOptions {
	const parsed = ts.getParsedCommandLineOfConfigFile(
		resolve(configPath),
		{},
		{ ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
	);
	if (!parsed) throw new Error(`No se pudo leer ${configPath}`);
	return parsed.options;
}

// Programa en memoria con dos archivos virtuales; solo se miden los diagnósticos semánticos de `b.ts`,
// porque `noLib` hace que el resto del programa reporte errores globales que no vienen al caso.
function diagnosticCodesForImport(options: ts.CompilerOptions, importLine: string): number[] {
	const files: Record<string, string> = {
		'/a.ts': 'export interface Foo { x: number }',
		'/b.ts': `${importLine}\nexport const value: Foo = { x: 1 };`,
	};
	const compilerOptions: ts.CompilerOptions = {
		...options,
		noEmit: true,
		noLib: true,
		types: [],
		rootDir: undefined,
		baseUrl: undefined,
		paths: undefined,
	};
	const host = ts.createCompilerHost(compilerOptions);
	host.fileExists = (path) => path in files;
	host.readFile = (path) => files[path];
	host.getSourceFile = (path, languageVersion) =>
		path in files ? ts.createSourceFile(path, files[path], languageVersion) : undefined;

	const program = ts.createProgram(['/a.ts', '/b.ts'], compilerOptions, host);
	return program.getSemanticDiagnostics(program.getSourceFile('/b.ts')).map((diagnostic) => diagnostic.code);
}

describe('verbatimModuleSyntax', () => {
	it('covers every versioned tsconfig', () => {
		const versioned = execFileSync('git', ['ls-files', '--', 'tsconfig*.json', '**/tsconfig*.json'], {
			encoding: 'utf8',
		})
			.split(/\r?\n/)
			.filter(Boolean);

		expect([...TSCONFIGS].sort()).toEqual(versioned.sort());
	});

	describe.each(TSCONFIGS)('%s', (configPath) => {
		const UNMARKED_TYPE_ONLY_IMPORT = 1484;

		it('está activa', () => {
			expect(resolveOptions(configPath).verbatimModuleSyntax).toBe(true);
		});

		it('rechaza un binding de solo-tipo sin marcar', () => {
			const codes = diagnosticCodesForImport(resolveOptions(configPath), `import { Foo } from './a';`);

			expect(codes).toContain(UNMARKED_TYPE_ONLY_IMPORT);
		});

		it.each([`import type { Foo } from './a';`, `import { type Foo } from './a';`])(
			'acepta la forma marcada: %s',
			(importLine) => {
				const codes = diagnosticCodesForImport(resolveOptions(configPath), importLine);

				expect(codes).not.toContain(UNMARKED_TYPE_ONLY_IMPORT);
			},
		);
	});
});
