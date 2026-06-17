import { spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { storylistMock } from '@mocks/storylist.mock';
import { type Storylist } from '@models/storylist.model';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { StorylistSeoDirective } from './storylist-seo.directive';
import { STORYLIST_SEO_HOST } from './storylist-seo-host';

describe('StorylistSeoDirective', () => {
	const storylistSignal = signal<Storylist | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new StorylistSeoDirective());
	}

	beforeEach(() => {
		storylistSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				StorylistSeoDirective,
				MetaTagsDirective,
				{ provide: STORYLIST_SEO_HOST, useValue: { storylist: storylistSignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not apply SEO while the storylist is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the title and emit the CollectionPage and breadcrumb JSON-LD when the storylist resolves', () => {
		storylistSignal.set(storylistMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(storylistMock.title));
		const head = TestBed.inject(DOCUMENT).head;
		expect(JSON.parse(head.querySelector('script[data-schema-id="collection"]')?.textContent ?? '{}')).toMatchObject({
			'@type': 'CollectionPage',
		});
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-storylist"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		storylistSignal.set(storylistMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="collection"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-storylist"]')).toBeNull();
	});

	it('should re-apply the SEO when the storylist signal changes', () => {
		storylistSignal.set(storylistMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		storylistSignal.set({ ...storylistMock, title: 'Otra colección' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining('Otra colección'));
	});
});
