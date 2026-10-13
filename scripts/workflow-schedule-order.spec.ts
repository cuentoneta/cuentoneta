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
	const match = /- cron: '(\d+) (\d+) \S+ \S+ \S+'/.exec(workflow(file));
	if (!match) {
		throw new Error(`${file} no declara un cron`);
	}
	return Number(match[2]) * 60 + Number(match[1]);
}

/** Condición `if` del primer job del workflow, en una sola línea. */
function jobCondition(file: string): string {
	const block = /^ {4}if: >-\r?\n((?: {6}.+\r?\n)+)/m.exec(workflow(file))?.[1] ?? '';
	return block.replace(/\s+/g, ' ').trim();
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

	it('should run the datasets sync on manual dispatch and on scheduled, non-cancelled generator runs', () => {
		expect(jobCondition(SYNC)).toBe(
			"github.event_name == 'workflow_dispatch' || (github.event.workflow_run.event == 'schedule' && github.event.workflow_run.conclusion != 'cancelled')",
		);
	});

	it('should not measure the wall clock in the landing page generation job', () => {
		const generationJob = workflow(GENERATOR).split('notify-failure:')[0];

		expect(generationJob).not.toMatch(/\bdate\b/);
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
