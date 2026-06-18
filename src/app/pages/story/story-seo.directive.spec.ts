import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { storyMock } from '@mocks/story.mock';
import { type Story } from '@models/story.model';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { StorySeoDirective } from './story-seo.directive';
import { STORY_SEO_HOST } from './story-seo-host';

describe('StorySeoDirective', () => {
	const storySignal = signal<Story | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new StorySeoDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		storySignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				StorySeoDirective,
				HeadMetadataDirective,
				{ provide: STORY_SEO_HOST, useValue: { story: storySignal.asReadonly() } },
			],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not apply SEO while the story is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the title and emit the Article and breadcrumb JSON-LD when the story resolves', () => {
		storySignal.set(storyMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(`${storyMock.title} - ${storyMock.author.name}`));
		const head = TestBed.inject(DOCUMENT).head;
		expect(JSON.parse(head.querySelector('script[data-schema-id="article"]')?.textContent ?? '{}')).toMatchObject({
			'@type': 'Article',
		});
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-story"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		storySignal.set(storyMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="article"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="article"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-story"]')).toBeNull();
	});

	it('should re-apply the SEO when the story signal changes', () => {
		storySignal.set(storyMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		storySignal.set({ ...storyMock, title: 'Otro título' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining(`Otro título - ${storyMock.author.name}`));
	});
});
