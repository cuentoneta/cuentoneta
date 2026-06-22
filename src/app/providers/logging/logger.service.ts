import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

export const LOG_LEVELS = Object.freeze({ error: 0, warn: 1, info: 2, debug: 3 } as const);
export type LogLevel = keyof typeof LOG_LEVELS;

type ConsoleMethod = 'error' | 'warn' | 'info' | 'log';

@Injectable({ providedIn: 'root' })
export class LoggerService {
	private readonly defaultLevel: LogLevel = environment.environment === 'production' ? 'error' : 'debug';
	private currentLevel: LogLevel = this.defaultLevel;

	public getLevel(): LogLevel {
		return this.currentLevel;
	}

	public setLevel(level: LogLevel): void {
		this.currentLevel = level;
	}

	public error(message: string, context?: unknown): void {
		this.emit('error', 'error', message, context);
	}

	public warn(message: string, context?: unknown): void {
		this.emit('warn', 'warn', message, context);
	}

	public info(message: string, context?: unknown): void {
		this.emit('info', 'info', message, context);
	}

	public debug(message: string, context?: unknown): void {
		this.emit('debug', 'log', message, context);
	}

	private isGated(level: LogLevel): boolean {
		return LOG_LEVELS[level] > LOG_LEVELS[this.currentLevel];
	}

	private emit(level: LogLevel, method: ConsoleMethod, message: string, context?: unknown): void {
		if (level !== 'error' && this.isGated(level)) {
			return;
		}
		const fn = console[method] as (message: string, context?: unknown) => void;
		if (context === undefined) {
			fn.call(console, message);
		} else {
			fn.call(console, message, context);
		}
	}
}
