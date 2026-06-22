import { environment } from '../_helpers/environment';

export const LOG_LEVELS = Object.freeze({ error: 0, warn: 1, info: 2, debug: 3 } as const);
export type LogLevel = keyof typeof LOG_LEVELS;

type ConsoleMethod = 'error' | 'warn' | 'info' | 'log';

const defaultLevel: LogLevel = environment.production ? 'error' : 'debug';
let currentLevel: LogLevel = defaultLevel;

function isGated(level: LogLevel): boolean {
	return LOG_LEVELS[level] > LOG_LEVELS[currentLevel];
}

function emit(level: LogLevel, method: ConsoleMethod, message: string, context?: unknown): void {
	if (level !== 'error' && isGated(level)) {
		return;
	}
	const fn = console[method] as (message: string, context?: unknown) => void;
	if (context === undefined) {
		fn.call(console, message);
	} else {
		fn.call(console, message, context);
	}
}

export const logger = {
	getLevel(): LogLevel {
		return currentLevel;
	},
	setLevel(level: LogLevel): void {
		currentLevel = level;
	},
	error(message: string, context?: unknown): void {
		emit('error', 'error', message, context);
	},
	warn(message: string, context?: unknown): void {
		emit('warn', 'warn', message, context);
	},
	info(message: string, context?: unknown): void {
		emit('info', 'info', message, context);
	},
	debug(message: string, context?: unknown): void {
		emit('debug', 'log', message, context);
	},
};
