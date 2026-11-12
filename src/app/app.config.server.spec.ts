import { TestBed } from '@angular/core/testing';
import { ɵHTTP_FETCH_MAX_RESPONSE_SIZE as HTTP_FETCH_MAX_RESPONSE_SIZE } from '@angular/common/http';

import { config, SSR_MAX_RESPONSE_BODY_SIZE } from './app.config.server';

describe('server config', () => {
	// provideServerRendering marca el proceso como servidor en un global; se restaura para no cambiarle
	// el modo a otro spec que corra en el mismo worker.
	const serverMode = Object.getOwnPropertyDescriptor(globalThis, 'ngServerMode');
	afterEach(() => {
		if (serverMode) {
			Object.defineProperty(globalThis, 'ngServerMode', serverMode);
		} else {
			Reflect.deleteProperty(globalThis, 'ngServerMode');
		}
	});

	it('should let the SSR read API responses beyond the default 1 MiB limit', () => {
		TestBed.configureTestingModule({ providers: config.providers });

		expect(TestBed.inject(HTTP_FETCH_MAX_RESPONSE_SIZE)).toBe(SSR_MAX_RESPONSE_BODY_SIZE);
		expect(SSR_MAX_RESPONSE_BODY_SIZE).toBeGreaterThan(1024 * 1024);
	});
});
