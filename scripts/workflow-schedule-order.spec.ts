import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const SYNC = 'sync-datasets.yml';
const GENERATOR = 'add-next-weeks-landing-page-content.yml';
const MOST_READ = 'update-most-read.yml';

function workflow(file: string): string {
	return readFileSync(join(__dirname, '..', '.github', 'workflows', file), 'utf8');
}

/** Devuelve el minuto del día UTC del único `cron` del workflow. */
function minuteOfDay(file: string): number {
	const match = /- cron: '(\d+) (\d+) \S+ \S+ (\S+)'/.exec(workflow(file));
	if (!match) {
		throw new Error(`${file} no declara un cron`);
	}
	return Number(match[2]) * 60 + Number(match[1]);
}

/** Timeout del primer job del workflow. */
function timeoutMinutes(file: string): number {
	return Number(/timeout-minutes: (\d+)/.exec(workflow(file))?.[1]);
}

function workflowName(file: string): string {
	return /^name: (.+)$/m.exec(workflow(file))?.[1] ?? '';
}

describe('horario de las tareas programadas de producto', () => {
	it('should chain the datasets sync to the landing page generator instead of scheduling it', () => {
		const sync = workflow(SYNC);

		expect(sync).not.toContain('cron:');
		expect(sync).toContain(`workflows: ['${workflowName(GENERATOR)}']`);
	});

	it('should chain the datasets sync only to scheduled generator runs', () => {
		expect(workflow(SYNC)).toContain("github.event.workflow_run.event == 'schedule'");
	});

	it('should not gate the landing page generator on the wall clock', () => {
		expect(workflow(GENERATOR)).not.toMatch(/late_start|Arranque tardío/);
	});

	it('should finish the most-read update before the generator starts', () => {
		expect(minuteOfDay(MOST_READ) + timeoutMinutes(MOST_READ)).toBeLessThan(minuteOfDay(GENERATOR));
	});

	it.each([GENERATOR, MOST_READ])('should declare the dependency on the datasets sync in %s', (file) => {
		expect(workflow(file)).toContain(SYNC);
	});

	// El `.env` que `pnpm ops` lee apunta a `development`: sin fijar el dataset, la corrida escribiría ahí.
	it.each([GENERATOR, MOST_READ])('should pin the production dataset in %s', (file) => {
		expect(workflow(file)).toContain('SANITY_STUDIO_DATASET: production');
	});
});
