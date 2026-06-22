/* eslint-disable testing-library/no-debugging-utils -- logger.debug() es el método de logging bajo test, no screen.debug() de RTL */
import { restoreAllMocks, spyOn } from '@test-utils';

import { logger, LOG_LEVELS, type LogLevel } from './logger';

describe('logger', () => {
	let errorSpy: ReturnType<typeof spyOn>;
	let warnSpy: ReturnType<typeof spyOn>;
	let infoSpy: ReturnType<typeof spyOn>;
	let logSpy: ReturnType<typeof spyOn>;

	beforeEach(() => {
		errorSpy = spyOn(console, 'error').mockImplementation(() => undefined);
		warnSpy = spyOn(console, 'warn').mockImplementation(() => undefined);
		infoSpy = spyOn(console, 'info').mockImplementation(() => undefined);
		logSpy = spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('exposes the four severity levels ordered from most to least severe', () => {
		expect(LOG_LEVELS.error).toBeLessThan(LOG_LEVELS.warn);
		expect(LOG_LEVELS.warn).toBeLessThan(LOG_LEVELS.info);
		expect(LOG_LEVELS.info).toBeLessThan(LOG_LEVELS.debug);
	});

	describe('error', () => {
		it('always logs errors regardless of the configured level', () => {
			logger.setLevel('error');

			logger.error('boom', { code: 500 });

			expect(errorSpy).toHaveBeenCalledWith('boom', { code: 500 });
		});

		it('logs the message without context when context is omitted', () => {
			logger.setLevel('error');

			logger.error('boom');

			expect(errorSpy).toHaveBeenCalledWith('boom');
		});
	});

	describe('level gating', () => {
		it('logs every level when the level is debug', () => {
			logger.setLevel('debug');

			logger.error('e');
			logger.warn('w');
			logger.info('i');
			logger.debug('d');

			expect(errorSpy).toHaveBeenCalledWith('e');
			expect(warnSpy).toHaveBeenCalledWith('w');
			expect(infoSpy).toHaveBeenCalledWith('i');
			expect(logSpy).toHaveBeenCalledWith('d');
		});

		it('suppresses debug when the level is info', () => {
			logger.setLevel('info');

			logger.error('e');
			logger.warn('w');
			logger.info('i');
			logger.debug('d');

			expect(errorSpy).toHaveBeenCalledWith('e');
			expect(warnSpy).toHaveBeenCalledWith('w');
			expect(infoSpy).toHaveBeenCalledWith('i');
			expect(logSpy).not.toHaveBeenCalled();
		});

		it('suppresses info and debug when the level is warn', () => {
			logger.setLevel('warn');

			logger.warn('w');
			logger.info('i');
			logger.debug('d');

			expect(warnSpy).toHaveBeenCalledWith('w');
			expect(infoSpy).not.toHaveBeenCalled();
			expect(logSpy).not.toHaveBeenCalled();
		});

		it('suppresses warn, info and debug when the level is error (production)', () => {
			logger.setLevel('error');

			logger.error('e');
			logger.warn('w');
			logger.info('i');
			logger.debug('d');

			expect(errorSpy).toHaveBeenCalledWith('e');
			expect(warnSpy).not.toHaveBeenCalled();
			expect(infoSpy).not.toHaveBeenCalled();
			expect(logSpy).not.toHaveBeenCalled();
		});
	});

	describe('setLevel / getLevel', () => {
		it('exposes the current level after setLevel', () => {
			logger.setLevel('warn');

			expect(logger.getLevel()).toBe<LogLevel>('warn');
		});
	});
});
