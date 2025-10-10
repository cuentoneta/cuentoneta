import { MetaTagsDirective } from './meta-tags.directive';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

describe('MetaTagsDirective', () => {
	const BASE_URL = 'https://www.cuentoneta.ar';

	let directive: MetaTagsDirective;
	let metaService: Meta;
	let titleService: Title;
	let document: Document;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [MetaTagsDirective],
		});

		TestBed.runInInjectionContext(() => {
			directive = new MetaTagsDirective();
			metaService = TestBed.inject(Meta);
			titleService = TestBed.inject(Title);
			document = TestBed.inject(DOCUMENT);
		});
	});

	it('should create an instance', () => {
		expect(directive).toBeTruthy();
	});

	describe('setTitle', () => {
		it('should set title with prefix by default', () => {
			const titleSpy = jest.spyOn(titleService, 'setTitle');
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setTitle('Test Title');

			expect(titleSpy).toHaveBeenCalledWith('Test Title | La Cuentoneta');
			expect(metaSpy).toHaveBeenCalledWith({
				name: 'twitter:title',
				content: 'Test Title',
			});
			expect(metaSpy).toHaveBeenCalledWith({
				property: 'og:title',
				content: 'Test Title',
			});
		});

		it('should set title without prefix when addPrefix is false', () => {
			const titleSpy = jest.spyOn(titleService, 'setTitle');

			directive.setTitle('Test Title', false);

			expect(titleSpy).toHaveBeenCalledWith('Test Title');
		});
	});

	describe('setDescription', () => {
		it('should set description meta tags', () => {
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setDescription('Test description');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'description',
				content: 'Test description',
			});
			expect(metaSpy).toHaveBeenCalledWith({
				name: 'twitter:description',
				content: 'Test description',
			});
			expect(metaSpy).toHaveBeenCalledWith({
				property: 'og:description',
				content: 'Test description',
			});
		});
	});

	describe('setDefault', () => {
		it('should set default title and description', () => {
			const setTitleSpy = jest.spyOn(directive, 'setTitle');
			const setDefaultDescriptionSpy = jest.spyOn(directive, 'setDefaultDescription');

			directive.setDefault();

			expect(setTitleSpy).toHaveBeenCalledWith('La Cuentoneta', false);
			expect(setDefaultDescriptionSpy).toHaveBeenCalled();
		});
	});

	describe('setDefaultDescription', () => {
		it('should set default description', () => {
			const setDescriptionSpy = jest.spyOn(directive, 'setDescription');

			directive.setDefaultDescription();

			expect(setDescriptionSpy).toHaveBeenCalledWith(
				'Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
		});
	});

	describe('setCanonicalUrl', () => {
		it('should create and set canonical link element if it does not exist', () => {
			const url = `${BASE_URL}/test`;

			directive.setCanonicalUrl(url);

			const linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
			expect(linkElement).toBeTruthy();
			expect(linkElement).toBeInstanceOf(HTMLLinkElement);
			expect(linkElement).toHaveAttribute('rel', 'canonical');
			expect(linkElement).toHaveAttribute('href', url);
			expect(linkElement.parentElement).toBe(document.head);
		});

		it('should update existing canonical link element', () => {
			const initialUrl = `${BASE_URL}/initial`;
			const updatedUrl = `${BASE_URL}/updated`;

			directive.setCanonicalUrl(initialUrl);
			directive.setCanonicalUrl(updatedUrl);

			const linkElements = document.querySelectorAll('link[rel="canonical"]');
			expect(linkElements.length).toBe(1);
			expect(linkElements[0]).toBeInstanceOf(HTMLLinkElement);
			expect(linkElements[0]).toHaveAttribute('rel', 'canonical');
			expect(linkElements[0]).toHaveAttribute('href', updatedUrl);
			expect(linkElements[0].parentElement).toBe(document.head);
		});
	});

	describe('removeCanonicalUrl', () => {
		it('should remove canonical link element if it exists', () => {
			directive.setCanonicalUrl(`${BASE_URL}/test`);

			let linkElement = document.querySelector('link[rel="canonical"]');
			expect(linkElement).toBeTruthy();

			directive.removeCanonicalUrl();

			linkElement = document.querySelector('link[rel="canonical"]');
			expect(linkElement).toBeFalsy();
		});

		it('should not throw error if canonical link does not exist', () => {
			expect(() => directive.removeCanonicalUrl()).not.toThrow();
		});
	});

	describe('setRobots', () => {
		it('should set robots meta tag with "index, follow"', () => {
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setRobots('index, follow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'index, follow',
			});
		});

		it('should set robots meta tag with "noindex, nofollow"', () => {
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setRobots('noindex, nofollow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'noindex, nofollow',
			});
		});

		it('should set robots meta tag with "index, nofollow"', () => {
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setRobots('index, nofollow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'index, nofollow',
			});
		});

		it('should set robots meta tag with "noindex, follow"', () => {
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setRobots('noindex, follow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'noindex, follow',
			});
		});

		it('should set robots meta tag with "all"', () => {
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setRobots('all');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'all',
			});
		});

		it('should set robots meta tag with "none"', () => {
			const metaSpy = jest.spyOn(metaService, 'updateTag');

			directive.setRobots('none');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'none',
			});
		});
	});

	describe('removeRobots', () => {
		it('should remove robots meta tag', () => {
			const metaSpy = jest.spyOn(metaService, 'removeTag');

			directive.removeRobots();

			expect(metaSpy).toHaveBeenCalledWith('name="robots"');
		});
	});
});
