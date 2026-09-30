import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const WORKFLOWS_DIR = join(__dirname, '..', '.github', 'workflows');
const SYNC = 'sync-datasets.yml';
const GENERATOR = 'add-next-weeks-landing-page-content.yml';
const MOST_READ = 'update-most-read.yml';
const SUNDAY = '0';
const GENERATOR_MARGIN_MINUTES = 30;

function workflow(file: string): string {
	return readFileSync(join(WORKFLOWS_DIR, file), 'utf8');
}

/** Devuelve el minuto del día UTC y el día de semana del único `cron` del workflow. */
function schedule(file: string): { minuteOfDay: number; weekday: string } {
	const [, minute, hour, , , weekday] = /- cron: '(\S+) (\S+) (\S+) (\S+) (\S+)'/.exec(workflow(file)) as string[] &
		RegExpExecArray;
	return { minuteOfDay: Number(hour) * 60 + Number(minute), weekday };
}

function timeoutMinutes(file: string): number {
	return Number(/timeout-minutes: (\d+)/.exec(workflow(file))?.[1]);
}

describe('horario de las tareas programadas de producto', () => {
	it('should run the landing page generator on the same weekday as the datasets sync', () => {
		expect(schedule(GENERATOR).weekday).toBe(SUNDAY);
		expect(schedule(SYNC).weekday).toBe(SUNDAY);
	});

	it('should run the landing page generator 30 minutes before the datasets sync', () => {
		expect(schedule(SYNC).minuteOfDay - schedule(GENERATOR).minuteOfDay).toBe(GENERATOR_MARGIN_MINUTES);
	});

	it('should time out the landing page generator inside its margin', () => {
		expect(timeoutMinutes(GENERATOR)).toBeLessThan(GENERATOR_MARGIN_MINUTES);
	});

	it('should finish the most-read update before the generator starts', () => {
		const { minuteOfDay } = schedule(MOST_READ);

		expect(minuteOfDay + timeoutMinutes(MOST_READ)).toBeLessThan(schedule(GENERATOR).minuteOfDay);
	});

	it.each([GENERATOR, MOST_READ])('should declare the dependency on the datasets sync in %s', (file) => {
		expect(workflow(file)).toContain(SYNC);
	});
});
