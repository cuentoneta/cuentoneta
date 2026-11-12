import { TestBed } from '@angular/core/testing';
import { ɵHTTP_FETCH_MAX_RESPONSE_SIZE as HTTP_FETCH_MAX_RESPONSE_SIZE } from '@angular/common/http';

import { config, SSR_MAX_RESPONSE_BODY_SIZE } from './app.config.server';

describe('server config', () => {
	it('should let the SSR read API responses beyond the default 1 MiB limit', () => {
		TestBed.configureTestingModule({ providers: config.providers });

		expect(TestBed.inject(HTTP_FETCH_MAX_RESPONSE_SIZE)).toBe(SSR_MAX_RESPONSE_BODY_SIZE);
		expect(SSR_MAX_RESPONSE_BODY_SIZE).toBeGreaterThan(1024 * 1024);
	});
});
