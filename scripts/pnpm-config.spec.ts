import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

// pnpm 11 ignora el campo `pnpm` de package.json y no avisa que un pin dejó de aplicar.
// La igualdad entre el yaml y el lockfile ya la impone `--frozen-lockfile` en CI.
describe.each(['.', 'cms'])('settings de pnpm de %s', (project) => {
	it('should not declare the pnpm field in package.json', () => {
		const manifest = JSON.parse(readFileSync(join(ROOT, project, 'package.json'), 'utf8')) as Record<string, unknown>;

		expect(manifest).not.toHaveProperty('pnpm');
	});

	it('should declare its overrides in pnpm-workspace.yaml', () => {
		const workspace = readFileSync(join(ROOT, project, 'pnpm-workspace.yaml'), 'utf8');

		expect(workspace).toMatch(/^overrides:\s*$/m);
	});
});
