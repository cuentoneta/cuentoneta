import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const SYNC = 'sync-datasets.yml';
const GENERATOR = 'add-next-weeks-landing-page-content.yml';
const MOST_READ = 'update-most-read.yml';
const GENERATOR_MARGIN_MINUTES = 30;

function workflow(file: string): string {
	return readFileSync(join(__dirname, '..', '.github', 'workflows', file), 'utf8');
}

/** Devuelve el minuto del día UTC y el día de semana del único `cron` del workflow. */
function schedule(file: string): { minuteOfDay: number; weekday: string } {
	const match = /- cron: '(\d+) (\d+) \S+ \S+ (\S+)'/.exec(workflow(file));
	if (!match) {
		throw new Error(`${file} no declara un cron`);
	}
	return { minuteOfDay: Number(match[2]) * 60 + Number(match[1]), weekday: match[3] };
}

/** Timeout del primer job del workflow. */
function timeoutMinutes(file: string): number {
	return Number(/timeout-minutes: (\d+)/.exec(workflow(file))?.[1]);
}

function formatHhmm(minuteOfDay: number): string {
	return `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}${String(minuteOfDay % 60).padStart(2, '0')}`;
}

describe('horario de las tareas programadas de producto', () => {
	it('should run the landing page generator on the same weekday as the datasets sync', () => {
		expect(schedule(GENERATOR).weekday).toBe(schedule(SYNC).weekday);
	});

	it('should run the landing page generator 30 minutes before the datasets sync', () => {
		expect(schedule(SYNC).minuteOfDay - schedule(GENERATOR).minuteOfDay).toBe(GENERATOR_MARGIN_MINUTES);
	});

	it('should time out the landing page generator inside its margin', () => {
		expect(timeoutMinutes(GENERATOR)).toBeLessThan(GENERATOR_MARGIN_MINUTES);
	});

	it('should abort a late start when the timeout can no longer finish before the sync', () => {
		const latestStart = formatHhmm(schedule(SYNC).minuteOfDay - timeoutMinutes(GENERATOR));

		expect(workflow(GENERATOR)).toContain(`'${latestStart}'`);
	});

	it('should finish the most-read update before the generator starts', () => {
		const { minuteOfDay } = schedule(MOST_READ);

		expect(minuteOfDay + timeoutMinutes(MOST_READ)).toBeLessThan(schedule(GENERATOR).minuteOfDay);
	});

	it.each([GENERATOR, MOST_READ])('should declare the dependency on the datasets sync in %s', (file) => {
		expect(workflow(file)).toContain(SYNC);
	});

	// El `.env` que `pnpm ops` lee apunta a `development`: sin fijar el dataset, la corrida escribiría ahí.
	it.each([GENERATOR, MOST_READ])('should pin the production dataset in %s', (file) => {
		expect(workflow(file)).toContain('SANITY_STUDIO_DATASET: production');
	});

	it.each([GENERATOR, MOST_READ])('should apply on the scheduled run of %s', (file) => {
		expect(workflow(file)).toContain("apply_flag='--no-dry-run'");
	});
});
