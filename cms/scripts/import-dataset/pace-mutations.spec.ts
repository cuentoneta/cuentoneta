import { describe, expect, it } from 'vitest';

import { createPace, paceMutations, type Clock, type Pace } from './pace-mutations';

// Reloj que avanza solo cuando se duerme, y registra cuánto se le pidió dormir.
class FakeClock implements Clock {
	public readonly sleeps: number[] = [];
	private current = 1000;

	public now(): number {
		return this.current;
	}

	public async sleep(milliseconds: number): Promise<void> {
		this.sleeps.push(milliseconds);
		this.current += milliseconds;
	}
}

// Ritmo que solo cuenta las tareas que pasan por él.
function spyPace() {
	const calls: number[] = [];
	const pace: Pace = (task) => {
		calls.push(calls.length);
		return task();
	};
	return { pace, calls };
}

// Con la forma encadenable de los builders de @sanity/client: cada método devuelve `this`.
class SpyBuilder {
	public readonly operations: string[] = [];
	public committed = 0;

	public set(field: string) {
		this.operations.push(`set ${field}`);
		return this;
	}

	public patch(id: string) {
		this.operations.push(`patch ${id}`);
		return this;
	}

	public async commit() {
		this.committed++;
		return { ok: true };
	}
}

class SpyClient {
	public readonly builders: SpyBuilder[] = [];

	public transaction() {
		return this.track();
	}

	public patch(id: string) {
		return this.track().patch(id);
	}

	public withConfig() {
		return new SpyClient();
	}

	public config() {
		return { dataset: 'staging' };
	}

	private track() {
		const builder = new SpyBuilder();
		this.builders.push(builder);
		return builder;
	}
}

describe('createPace', () => {
	it('spaces the start of consecutive tasks by the interval', async () => {
		// Las tres llegan en el mismo instante: el reloj no avanza mientras se reparten los turnos.
		const sleeps: number[] = [];
		const stoppedClock: Clock = {
			now: () => 1000,
			sleep: async (milliseconds) => {
				sleeps.push(milliseconds);
			},
		};
		const pace = createPace('100ms', stoppedClock);

		await Promise.all([pace(async () => 'a'), pace(async () => 'b'), pace(async () => 'c')]);

		expect(sleeps).toEqual([100, 200]);
	});

	it('does not wait once the interval has already passed', async () => {
		const clock = new FakeClock();
		const pace = createPace('100ms', clock);

		await pace(async () => 'a');
		await clock.sleep(500);
		await pace(async () => 'b');

		expect(clock.sleeps).toEqual([500]);
	});

	it('returns what the task returns', async () => {
		await expect(createPace('100ms', new FakeClock())(async () => 42)).resolves.toBe(42);
	});
});

describe('paceMutations', () => {
	it('paces the commit at the end of a chained transaction', async () => {
		const client = new SpyClient();
		const { pace, calls } = spyPace();

		await paceMutations(client, pace).transaction().patch('work-1').patch('work-2').commit();

		expect(calls).toHaveLength(1);
		expect(client.builders[0]?.operations).toEqual(['patch work-1', 'patch work-2']);
		expect(client.builders[0]?.committed).toBe(1);
	});

	it('paces the commit of a single patch', async () => {
		const client = new SpyClient();
		const { pace, calls } = spyPace();

		await paceMutations(client, pace).patch('asset-1').set('metadata').commit();

		expect(calls).toHaveLength(1);
		expect(client.builders[0]?.committed).toBe(1);
	});

	it('keeps the pace on a client derived with withConfig', async () => {
		const { pace, calls } = spyPace();

		await paceMutations(new SpyClient(), pace).withConfig().transaction().commit();

		expect(calls).toHaveLength(1);
	});

	it('leaves reads untouched', () => {
		const { pace, calls } = spyPace();

		expect(paceMutations(new SpyClient(), pace).config()).toEqual({ dataset: 'staging' });
		expect(calls).toHaveLength(0);
	});
});
