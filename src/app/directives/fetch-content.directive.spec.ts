import { FetchContentDirective } from './fetch-content.directive';
import { TestBed } from '@angular/core/testing';
import { storyMock } from '../mocks/story.mock';
import { of } from 'rxjs';
import { authorMock } from '../mocks/author.mock';
import { PLATFORM_ID } from '@angular/core';

describe('FetchContentDirective', () => {
	it('should create an instance', () => {
		TestBed.runInInjectionContext(() => {
			const directive = new FetchContentDirective();
			expect(directive).toBeTruthy();
		});
	});

	describe('run tests for server platform', () => {
		beforeEach(async () => {
			TestBed.configureTestingModule({
				providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
			});
		});

		it('should fetch content from a story mock in the server', () => {
			TestBed.runInInjectionContext(() => {
				const directive = new FetchContentDirective();
				expect(directive).toBeTruthy();
				expect(directive.isLoading).toBeFalsy();

				const source$ = of(storyMock);
				const fetchContent$ = directive.fetchContent$(source$);
				expect(directive.isLoading).toBeTruthy();

				fetchContent$.subscribe((data) => {
					expect(data).toEqual(storyMock);
					expect(directive.isLoading).toBeFalsy();
				});
			});
		});

		it('should fetch content from an author mock in the server', () => {
			TestBed.runInInjectionContext(() => {
				const directive = new FetchContentDirective();
				expect(directive).toBeTruthy();
				expect(directive.isLoading).toBeFalsy();

				const source$ = of(authorMock);
				const fetchContent$ = directive.fetchContent$(source$);
				expect(directive.isLoading).toBeTruthy();

				fetchContent$.subscribe((data) => {
					expect(data).toEqual(authorMock);
					expect(directive.isLoading).toBeFalsy();
				});
			});
		});
	});

	describe('run tests for browser platform', () => {
		beforeEach(async () => {
			TestBed.configureTestingModule({
				providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
			});
		});

		it('should fetch content from a story mock in the client', () => {
			TestBed.runInInjectionContext(() => {
				const directive = new FetchContentDirective();
				expect(directive).toBeTruthy();
				expect(directive.isLoading).toBeFalsy();

				const source$ = of(storyMock);
				const fetchContent$ = directive.fetchContent$(source$);
				expect(directive.isLoading).toBeTruthy();

				fetchContent$.subscribe((data) => {
					expect(data).toEqual(storyMock);
					expect(directive.isLoading).toBeFalsy();
				});
			});
		});

		it('should fetch content from an author mock in the client', () => {
			TestBed.runInInjectionContext(() => {
				const directive = new FetchContentDirective();
				expect(directive).toBeTruthy();
				expect(directive.isLoading).toBeFalsy();

				const source$ = of(authorMock);
				const fetchContent$ = directive.fetchContent$(source$);
				expect(directive.isLoading).toBeTruthy();

				fetchContent$.subscribe((data) => {
					expect(data).toEqual(authorMock);
					expect(directive.isLoading).toBeFalsy();
				});
			});
		});
	});
});
