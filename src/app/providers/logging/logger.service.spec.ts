/* eslint-disable testing-library/no-debugging-utils -- service.debug() es el método de logging bajo test, no screen.debug() de RTL */
import { TestBed } from '@angular/core/testing';
import { restoreAllMocks, spyOn } from '@test-utils';

import { LoggerService, LOG_LEVELS, type LogLevel } from './logger.service';

describe('LoggerService', () => {
	let service: LoggerService;
	let errorSpy: ReturnType<typeof spyOn>;
	let warnSpy: ReturnType<typeof spyOn>;
	let infoSpy: ReturnType<typeof spyOn>;
	let logSpy: ReturnType<typeof spyOn>;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(LoggerService);
		errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);
		warnSpy = spyOn(console, 'warn').mockImplementation(() => undefined);
		infoSpy = spyOn(console, 'info').mockImplementation(() => undefined);
		logSpy = spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('defaults to debug in the development environment', () => {
		expect(service.getLevel()).toBe<LogLevel>('debug');
	});

	it('exposes the four severity levels ordered from most to least severe', () => {
		expect(LOG_LEVELS.error).toBeLessThan(LOG_LEVELS.warn);
		expect(LOG_LEVELS.warn).toBeLessThan(LOG_LEVELS.info);
		expect(LOG_LEVELS.info).toBeLessThan(LOG_LEVELS.debug);
	});

	describe('error', () => {
		it('always logs errors regardless of the configured level', () => {
			service.setLevel('error');

			service.error('boom', { code: 500 });

			expect(errorSpy).toHaveBeenCalledWith('boom', { code: 500 });
		});

		it('logs the message without context when context is omitted', () => {
			service.setLevel('error');

			service.error('boom');

			expect(errorSpy).toHaveBeenCalledWith('boom');
		});
	});

	describe('level gating', () => {
		it('logs every level when the level is debug', () => {
			service.setLevel('debug');

			service.error('e');
			service.warn('w');
			service.info('i');
			service.debug('d');

			expect(errorSpy).toHaveBeenCalledWith('e');
			expect(warnSpy).toHaveBeenCalledWith('w');
			expect(infoSpy).toHaveBeenCalledWith('i');
			expect(logSpy).toHaveBeenCalledWith('d');
		});

		it('suppresses debug when the level is info', () => {
			service.setLevel('info');

			service.error('e');
			service.warn('w');
			service.info('i');
			service.debug('d');

			expect(errorSpy).toHaveBeenCalledWith('e');
			expect(warnSpy).toHaveBeenCalledWith('w');
			expect(infoSpy).toHaveBeenCalledWith('i');
			expect(logSpy).not.toHaveBeenCalled();
		});

		it('suppresses info and debug when the level is warn', () => {
			service.setLevel('warn');

			service.warn('w');
			service.info('i');
			service.debug('d');

			expect(warnSpy).toHaveBeenCalledWith('w');
			expect(infoSpy).not.toHaveBeenCalled();
			expect(logSpy).not.toHaveBeenCalled();
		});

		it('suppresses warn, info and debug when the level is error (production)', () => {
			service.setLevel('error');

			service.error('e');
			service.warn('w');
			service.info('i');
			service.debug('d');

			expect(errorSpy).toHaveBeenCalledWith('e');
			expect(warnSpy).not.toHaveBeenCalled();
			expect(infoSpy).not.toHaveBeenCalled();
			expect(logSpy).not.toHaveBeenCalled();
		});
	});

	describe('setLevel / getLevel', () => {
		it('exposes the current level after setLevel', () => {
			service.setLevel('warn');

			expect(service.getLevel()).toBe<LogLevel>('warn');
		});
	});

	describe('context passthrough', () => {
		it('passes the context object through to the console method', () => {
			service.setLevel('debug');
			const ctx = { foo: 'bar' };

			service.warn('hello', ctx);

			expect(warnSpy).toHaveBeenCalledWith('hello', ctx);
		});

		it('calls the console method with a single argument when context is omitted', () => {
			service.setLevel('debug');

			service.info('hello');

			expect(infoSpy).toHaveBeenCalledWith('hello');
		});
	});
});
