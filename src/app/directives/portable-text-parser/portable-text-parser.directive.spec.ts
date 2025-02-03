import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { authorMock } from '../../mocks/author.mock';
import { storyMock } from '../../mocks/story.mock';
import { PortableTextDirective } from './portable-text-parser.directive';

@Component({
	imports: [PortableTextDirective],
	template: `<article>
		@for (paragraph of content(); track $index) {
			<p [portableText]="paragraph" [classes]="classes()"></p>
		}
	</article>`,
})
class TestComponent {
	content = signal(authorMock.biography);
	classes = signal('test-class');
}

describe('PortableTextDirective', () => {
	let component: TestComponent;
	let fixture: ComponentFixture<TestComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestComponent, PortableTextDirective],
		}).compileComponents();

		fixture = TestBed.createComponent(TestComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('Author biography formatting', () => {
		it('should format author name in bold', () => {
			component.content.set(authorMock.biography);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const boldText = container.querySelector('b');
			expect(boldText?.textContent.trim()).toBe('François Onoff');
		});

		it('should format book titles in italics', () => {
			// Set the paragraph containing book titles
			component.content.set(authorMock.biography);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const italicElements = container.querySelectorAll('i');

			const bookTitles = ['El palacio de las nueve fronteras', 'Ecos del silencio', 'Sinfonía de sombras'];

			bookTitles.forEach((title) => {
				const found = Array.from(italicElements).some((el: any) => el.textContent.includes(title));
				expect(found).toBeTruthy();
			});
		});

		it('should render complete biography with correct formatting', () => {
			component.content.set(authorMock.biography);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			expect(container.textContent).toBeTruthy();

			// Verify formatting is preserved
			if (container.textContent.includes('François Onoff')) {
				expect(container.querySelector('b')).toBeTruthy();
			}
			if (container.textContent.includes('El palacio de las nueve fronteras')) {
				expect(container.querySelector('i')).toBeTruthy();
			}
		});
	});

	describe('Story content formatting', () => {
		it('should format story title in bold and italics', () => {
			component.content.set(storyMock.summary);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const boldItalicElement = container.querySelector('b i');
			expect(boldItalicElement?.textContent).toBe('El espejo del tiempo');
		});

		it('should format book collection title in italics', () => {
			component.content.set(storyMock.summary);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const italicElements = container.querySelectorAll('i');
			const collectionTitle = Array.from(italicElements).some((el: any) => el.textContent === 'Ecos del Silencio');
			expect(collectionTitle).toBeTruthy();
		});
	});

	describe('Media description formatting', () => {
		it('should format links correctly', () => {
			component.content.set(storyMock.media[0].description);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const link = container.querySelector('a');

			expect(link).toBeTruthy();
			expect(link?.getAttribute('href')).toBe('https://www.youtube.com/@CanalMas');
			expect(link?.classList.contains('underline')).toBeTruthy();
			expect(link?.textContent).toBe('Canal+');
		});

		it('should format show title in italics', () => {
			component.content.set(storyMock.media[0].description);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const italicElements = container.querySelectorAll('i');
			const showTitle = Array.from(italicElements).some((el: any) => el.textContent === 'Le Ble Chateau');
			expect(showTitle).toBeTruthy();
		});
	});

	describe('Class handling', () => {
		it('should apply custom classes', () => {
			component.classes.set('custom-class test-class');
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const classes = container.querySelectorAll('p');

			classes.forEach((el: any) => {
				expect(el.classList.contains('custom-class')).toBeTruthy();
				expect(el.classList.contains('test-class')).toBeTruthy();
			});
		});

		it('should handle class updates', () => {
			component.classes.set('initial-class');
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const classes = container.querySelectorAll('p');

			classes.forEach((el: any) => {
				expect(el.classList.contains('initial-class')).toBeTruthy();
			});

			component.classes.set('updated-class');
			fixture.detectChanges();

			classes.forEach((el: any) => {
				expect(el.classList.contains('initial-class')).toBeFalsy();
				expect(el.classList.contains('updated-class')).toBeTruthy();
			});
		});
	});

	describe('Content updates', () => {
		it('should update content when signal changes', () => {
			const initialParagraph = authorMock.biography;
			const updatedParagraph = storyMock.summary;

			component.content.set(initialParagraph);
			fixture.detectChanges();

			let container = fixture.nativeElement.querySelector('article');
			expect(container.textContent).toContain('François Onoff');

			component.content.set(updatedParagraph);
			fixture.detectChanges();

			container = fixture.nativeElement.querySelector('article');
			expect(container.textContent).toContain('El espejo del tiempo');
		});

		// it('should handle line breaks', () => {
		// 	component.content.set({
		// 		children: [{ text: 'Line 1\nLine 2', marks: [] }],
		// 		markDefs: [],
		// 		_type: 'block',
		// 	});
		// 	fixture.detectChanges();
		//
		// 	const container = fixture.nativeElement.querySelector('article');
		// 	expect(container.querySelector('br')).toBeTruthy();
		//
		// 	const textNodes = container.childNodes;
		// 	expect(textNodes[0].textContent).toBe('Line 1');
		// 	expect(textNodes[2].textContent).toBe('Line 2');
		// });
	});
});
