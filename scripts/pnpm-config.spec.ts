import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

// pnpm 11+ no lee settings del campo `pnpm` de package.json ni de `.npmrc`, que solo aporta registro y
// autenticación: un setting que quede ahí deja de aplicar sin que nada falle. La igualdad entre el yaml y el
// lockfile ya la impone `--frozen-lockfile` en CI.
describe.each(['.', 'cms'])('settings de pnpm de %s', (project) => {
	const workspace = () => readFileSync(join(ROOT, project, 'pnpm-workspace.yaml'), 'utf8');

	it('should not declare the pnpm field in package.json', () => {
		const manifest = JSON.parse(readFileSync(join(ROOT, project, 'package.json'), 'utf8')) as Record<string, unknown>;

		expect(manifest).not.toHaveProperty('pnpm');
	});

	it('should declare its overrides in pnpm-workspace.yaml', () => {
		expect(workspace()).toMatch(/^overrides:\s*$/m);
	});

	it('should make the Node engine range an install barrier', () => {
		expect(workspace()).toMatch(/^engineStrict:\s*true\s*$/m);
	});

	it('should keep only registry and auth entries in .npmrc', () => {
		const npmrc = join(ROOT, project, '.npmrc');
		const settings = existsSync(npmrc)
			? readFileSync(npmrc, 'utf8')
					.split(/\r?\n/)
					.map((line) => line.trim())
					.filter((line) => line !== '' && !line.startsWith('#'))
			: [];

		const registryOrAuth =
			/^(@[\w-]+:)?registry=|^\/\/[^=]+:(_authToken|_auth|_password|username|email|certfile|keyfile)=/;
		expect(settings.filter((line) => !registryOrAuth.test(line))).toEqual([]);
	});
});
