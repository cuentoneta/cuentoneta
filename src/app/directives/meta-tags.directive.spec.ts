import { spyOn } from '@test-utils';
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
			const titleSpy = spyOn(titleService, 'setTitle');
			const metaSpy = spyOn(metaService, 'updateTag');

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
	});

	describe('setExactTitle', () => {
		it('should set the title verbatim without the brand suffix', () => {
			const titleSpy = spyOn(titleService, 'setTitle');
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setExactTitle('Cuentos | La Cuentoneta');

			expect(titleSpy).toHaveBeenCalledWith('Cuentos | La Cuentoneta');
			expect(metaSpy).toHaveBeenCalledWith({ name: 'twitter:title', content: 'Cuentos | La Cuentoneta' });
			expect(metaSpy).toHaveBeenCalledWith({ property: 'og:title', content: 'Cuentos | La Cuentoneta' });
		});
	});

	describe('removeTitle', () => {
		it('should clear the document title and remove twitter/og title tags', () => {
			const titleSpy = spyOn(titleService, 'setTitle');
			const metaSpy = spyOn(metaService, 'removeTag');

			directive.removeTitle();

			expect(titleSpy).toHaveBeenCalledWith('');
			expect(metaSpy).toHaveBeenCalledWith('name="twitter:title"');
			expect(metaSpy).toHaveBeenCalledWith('property="og:title"');
		});
	});

	describe('setDescription', () => {
		it('should set description meta tags', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

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

	describe('removeDescription', () => {
		it('should remove description, twitter and og description tags', () => {
			const metaSpy = spyOn(metaService, 'removeTag');

			directive.removeDescription();

			expect(metaSpy).toHaveBeenCalledWith('name="description"');
			expect(metaSpy).toHaveBeenCalledWith('name="twitter:description"');
			expect(metaSpy).toHaveBeenCalledWith('property="og:description"');
		});
	});

	describe('setDefault', () => {
		it('should set default title, description and keywords', () => {
			const setExactTitleSpy = spyOn(directive, 'setExactTitle');
			const setDefaultDescriptionSpy = spyOn(directive, 'setDefaultDescription');
			const setDefaultKeywordsSpy = spyOn(directive, 'setDefaultKeywords');

			directive.setDefault();

			expect(setExactTitleSpy).toHaveBeenCalledWith('La Cuentoneta');
			expect(setDefaultDescriptionSpy).toHaveBeenCalled();
			expect(setDefaultKeywordsSpy).toHaveBeenCalled();
		});
	});

	describe('setDefaultDescription', () => {
		it('should set default description', () => {
			const setDescriptionSpy = spyOn(directive, 'setDescription');

			directive.setDefaultDescription();

			expect(setDescriptionSpy).toHaveBeenCalledWith(
				'Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
		});
	});

	describe('setDefaultKeywords', () => {
		it('should set default keywords', () => {
			const setKeywordsSpy = spyOn(directive, 'setKeywords');

			directive.setDefaultKeywords();

			expect(setKeywordsSpy).toHaveBeenCalledWith(['cuentos', 'literatura', 'poemas', 'podcast', 'narraciones']);
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
		it('should expand "index, follow" into indexable robots with preview directives', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setRobots('index, follow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
			});
		});

		it('should set robots meta tag with "noindex, nofollow"', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setRobots('noindex, nofollow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'noindex, nofollow',
			});
		});

		it('should set robots meta tag with "index, nofollow"', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setRobots('index, nofollow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'index, nofollow',
			});
		});

		it('should set robots meta tag with "noindex, follow"', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setRobots('noindex, follow');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'noindex, follow',
			});
		});

		it('should expand "all" into indexable robots with preview directives', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setRobots('all');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
			});
		});

		it('should set robots meta tag with "none"', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setRobots('none');

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'robots',
				content: 'none',
			});
		});
	});

	describe('removeRobots', () => {
		it('should remove robots meta tag', () => {
			const metaSpy = spyOn(metaService, 'removeTag');

			directive.removeRobots();

			expect(metaSpy).toHaveBeenCalledWith('name="robots"');
		});
	});

	describe('setKeywords', () => {
		it('should set keywords meta tag with comma-separated string', () => {
			const metaSpy = spyOn(metaService, 'updateTag');
			const keywords = 'literatura, cuentos, lectura';

			directive.setKeywords(keywords);

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'keywords',
				content: keywords,
			});
		});

		it('should set keywords meta tag with array of keywords', () => {
			const metaSpy = spyOn(metaService, 'updateTag');
			const keywordsArray = ['literatura', 'cuentos', 'lectura'];
			const expectedContent = 'literatura, cuentos, lectura';

			directive.setKeywords(keywordsArray);

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'keywords',
				content: expectedContent,
			});
		});

		it('should handle array with single keyword', () => {
			const metaSpy = spyOn(metaService, 'updateTag');
			const keywordsArray = ['literatura'];

			directive.setKeywords(keywordsArray);

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'keywords',
				content: 'literatura',
			});
		});

		it('should handle empty string', () => {
			const metaSpy = spyOn(metaService, 'updateTag');
			const keywords = '';

			directive.setKeywords(keywords);

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'keywords',
				content: '',
			});
		});

		it('should handle empty array', () => {
			const metaSpy = spyOn(metaService, 'updateTag');
			const keywordsArray: string[] = [];

			directive.setKeywords(keywordsArray);

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'keywords',
				content: '',
			});
		});

		it('should handle keywords with special characters', () => {
			const metaSpy = spyOn(metaService, 'updateTag');
			const keywords = 'José, María, niños & niñas';

			directive.setKeywords(keywords);

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'keywords',
				content: keywords,
			});
		});

		it('should handle multiple keywords with spaces in array', () => {
			const metaSpy = spyOn(metaService, 'updateTag');
			const keywordsArray = ['literatura digital', 'lectores jóvenes', 'cuentos cortos'];
			const expectedContent = 'literatura digital, lectores jóvenes, cuentos cortos';

			directive.setKeywords(keywordsArray);

			expect(metaSpy).toHaveBeenCalledWith({
				name: 'keywords',
				content: expectedContent,
			});
		});
	});

	describe('removeKeywords', () => {
		it('should remove keywords meta tag', () => {
			const metaSpy = spyOn(metaService, 'removeTag');

			directive.removeKeywords();

			expect(metaSpy).toHaveBeenCalledWith('name="keywords"');
		});

		it('should not throw error when removing keywords', () => {
			expect(() => directive.removeKeywords()).not.toThrow();
		});

		it('should remove keywords after they were set', () => {
			const updateSpy = spyOn(metaService, 'updateTag');
			const removeSpy = spyOn(metaService, 'removeTag');

			directive.setKeywords(['prueba', 'palabras clave']);
			directive.removeKeywords();

			expect(updateSpy).toHaveBeenCalled();
			expect(removeSpy).toHaveBeenCalledWith('name="keywords"');
		});
	});

	describe('setAuthor', () => {
		it('should set the author meta tag', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setAuthor('François Onoff');

			expect(metaSpy).toHaveBeenCalledWith({ name: 'author', content: 'François Onoff' });
		});
	});

	describe('removeAuthor', () => {
		it('should remove the author meta tag', () => {
			const metaSpy = spyOn(metaService, 'removeTag');

			directive.removeAuthor();

			expect(metaSpy).toHaveBeenCalledWith('name="author"');
		});
	});

	describe('setArticleDates', () => {
		it('should set article published and modified time meta tags', () => {
			const metaSpy = spyOn(metaService, 'updateTag');

			directive.setArticleDates('2024-03-15', '2024-05-20T10:30:00Z');

			expect(metaSpy).toHaveBeenCalledWith({ property: 'article:published_time', content: '2024-03-15' });
			expect(metaSpy).toHaveBeenCalledWith({ property: 'article:modified_time', content: '2024-05-20T10:30:00Z' });
		});
	});

	describe('removeArticleDates', () => {
		it('should remove both article date meta tags', () => {
			const metaSpy = spyOn(metaService, 'removeTag');

			directive.removeArticleDates();

			expect(metaSpy).toHaveBeenCalledWith('property="article:published_time"');
			expect(metaSpy).toHaveBeenCalledWith('property="article:modified_time"');
		});
	});

	describe('reset on destroy', () => {
		it('should clean up every per-page tag (title, description, keywords, robots, author, article dates and canonical) when destroyed', () => {
			const removeSpy = spyOn(metaService, 'removeTag');
			// El canonical no se limpia con removeTag (quita un <link>): lo seteamos para verificar su remoción.
			directive.setCanonicalUrl(`${BASE_URL}/home`);
			expect(document.querySelector(`link[rel='canonical']`)).not.toBeNull();

			// La limpieza vive en un effect con onCleanup: se corre el effect y luego se destruye el
			// contexto de inyección del directive para disparar la limpieza.
			TestBed.tick();
			TestBed.resetTestingModule();

			// Meta tags por página que la limpieza remueve vía Meta.removeTag.
			expect(removeSpy).toHaveBeenCalledWith('name="twitter:title"');
			expect(removeSpy).toHaveBeenCalledWith('property="og:title"');
			expect(removeSpy).toHaveBeenCalledWith('name="description"');
			expect(removeSpy).toHaveBeenCalledWith('name="twitter:description"');
			expect(removeSpy).toHaveBeenCalledWith('property="og:description"');
			expect(removeSpy).toHaveBeenCalledWith('name="keywords"');
			expect(removeSpy).toHaveBeenCalledWith('name="robots"');
			expect(removeSpy).toHaveBeenCalledWith('name="author"');
			expect(removeSpy).toHaveBeenCalledWith('property="article:published_time"');
			expect(removeSpy).toHaveBeenCalledWith('property="article:modified_time"');
			// El <link rel="canonical"> se quita del head.
			expect(document.querySelector(`link[rel='canonical']`)).toBeNull();
		});
	});
});
