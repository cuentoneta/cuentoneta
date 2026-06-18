import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { authorMock } from '@mocks/author.mock';
import { type AuthorProfile } from '@models/author.model';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AuthorSeoDirective } from './author-seo.directive';
import { AUTHOR_SEO_HOST } from './author-seo-host';

describe('AuthorSeoDirective', () => {
	const authorSignal = signal<AuthorProfile | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new AuthorSeoDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		authorSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				AuthorSeoDirective,
				HeadMetadataDirective,
				{ provide: AUTHOR_SEO_HOST, useValue: { author: authorSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not apply SEO while the author is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the title and emit the ProfilePage and breadcrumb JSON-LD when the author resolves', () => {
		authorSignal.set(authorMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(authorMock.name));
		const head = TestBed.inject(DOCUMENT).head;
		expect(JSON.parse(head.querySelector('script[data-schema-id="profile-page"]')?.textContent ?? '{}')).toMatchObject({
			'@type': 'ProfilePage',
		});
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-author"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		authorSignal.set(authorMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="profile-page"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="profile-page"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-author"]')).toBeNull();
	});

	it('should re-apply the SEO when the author signal changes', () => {
		authorSignal.set(authorMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		authorSignal.set({ ...authorMock, name: 'Otra Autora' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining('Otra Autora'));
	});
});
