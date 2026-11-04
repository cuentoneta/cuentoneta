import { describe, expect, it } from 'vitest';

import {
	backoffFor,
	isRetriable,
	readRetryAfter,
	runWithBackoff,
	toMilliseconds,
	type Clock,
} from './retry';

const NOW = Date.parse('2026-11-04T12:00:00Z');

// Registra las esperas pedidas sin esperar de verdad.
class SpySleeper implements Clock {
	public readonly sleeps: number[] = [];

	public async sleep(milliseconds: number): Promise<void> {
		this.sleeps.push(milliseconds);
	}

	public now(): number {
		return NOW;
	}
}

// Con la forma que tienen los errores de @sanity/client: el status en la raíz y los headers en la respuesta.
function httpError(statusCode: number, headers: Record<string, string> = {}) {
	return Object.assign(new Error(`HTTP ${statusCode}`), { statusCode, response: { statusCode, headers } });
}

function failingTimes<T>(failures: readonly unknown[], value: T) {
	let calls = 0;
	const operation = async () => {
		const failure = failures[calls];
		calls++;
		if (failure !== undefined) {
			throw failure;
		}
		return value;
	};
	return { operation, calls: () => calls };
}

describe('toMilliseconds', () => {
	it('resolves milliseconds and seconds', () => {
		expect(toMilliseconds('200ms')).toBe(200);
		expect(toMilliseconds('3s')).toBe(toMilliseconds('3000ms'));
	});

	it('rejects any other unit', () => {
		const untyped = '1m' as Parameters<typeof toMilliseconds>[0];

		expect(() => toMilliseconds(untyped)).toThrow('1m');
	});
});

describe('readRetryAfter', () => {
	it('reads a delay in seconds from the response headers', () => {
		expect(readRetryAfter(httpError(429, { 'retry-after': '3' }), NOW)).toBe(toMilliseconds('3s'));
	});

	it('matches the header name regardless of case', () => {
		expect(readRetryAfter(httpError(429, { 'Retry-After': '2' }), NOW)).toBe(toMilliseconds('2s'));
	});

	it('reads an HTTP date as the time left until it', () => {
		const inFiveSeconds = new Date(NOW + toMilliseconds('5s')).toUTCString();

		expect(readRetryAfter(httpError(429, { 'retry-after': inFiveSeconds }), NOW)).toBe(toMilliseconds('5s'));
	});

	it('treats a missing or unreadable header as absent', () => {
		expect(readRetryAfter(httpError(429), NOW)).toBeUndefined();
		expect(readRetryAfter(httpError(429, { 'retry-after': 'soon' }), NOW)).toBeUndefined();
	});
});

describe('isRetriable', () => {
	it('retries rate limits, server errors and failures without a response', () => {
		expect(isRetriable(httpError(429))).toBe(true);
		expect(isRetriable(httpError(503))).toBe(true);
		expect(isRetriable(new Error('socket hang up'))).toBe(true);
	});

	it('does not retry conflicts or other client errors', () => {
		expect(isRetriable(httpError(409))).toBe(false);
		expect(isRetriable(httpError(400))).toBe(false);
	});
});

describe('backoffFor', () => {
	it('doubles on each attempt up to the ceiling', () => {
		expect([1, 2, 3, 6, 10].map(backoffFor)).toEqual(
			(['1s', '2s', '4s', '30s', '30s'] as const).map(toMilliseconds),
		);
	});
});

describe('runWithBackoff', () => {
	it('waits what Retry-After asks before retrying a rate limit', async () => {
		const clock = new SpySleeper();
		const { operation } = failingTimes([httpError(429, { 'retry-after': '3' })], 'done');

		const result = await runWithBackoff(operation, clock);

		expect(result).toEqual({ ok: true, value: 'done', attempts: 2 });
		expect(clock.sleeps).toEqual([toMilliseconds('3s')]);
	});

	it('honours a Retry-After longer than the backoff ceiling', async () => {
		const clock = new SpySleeper();
		const { operation } = failingTimes([httpError(429, { 'retry-after': '90' })], 'done');

		await runWithBackoff(operation, clock);

		expect(clock.sleeps).toEqual([toMilliseconds('90s')]);
	});

	it('falls back to the exponential backoff when there is no Retry-After', async () => {
		const clock = new SpySleeper();
		const { operation } = failingTimes([httpError(429), httpError(503)], 'done');

		await runWithBackoff(operation, clock);

		expect(clock.sleeps).toEqual([backoffFor(1), backoffFor(2)]);
	});

	it('gives up at once on an error that is not retriable', async () => {
		const clock = new SpySleeper();
		const conflict = httpError(409);
		const { operation, calls } = failingTimes([conflict], 'done');

		const result = await runWithBackoff(operation, clock);

		expect(result).toEqual({ ok: false, error: conflict, attempts: 1 });
		expect(calls()).toBe(1);
		expect(clock.sleeps).toEqual([]);
	});

	it('returns the last error once it runs out of attempts', async () => {
		const clock = new SpySleeper();
		const failures = Array.from({ length: 10 }, (_, index) => httpError(500 + index));
		const { operation, calls } = failingTimes(failures, 'done');

		const result = await runWithBackoff(operation, clock);

		expect(result).toMatchObject({ ok: false, error: failures[5], attempts: 6 });
		expect(calls()).toBe(6);
	});
});
