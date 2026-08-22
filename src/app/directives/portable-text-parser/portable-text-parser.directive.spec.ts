import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { storyMock } from '@mocks/story.mock';
import { storylistMock } from '@mocks/storylist.mock';
import { PortableTextDirective } from './portable-text-parser.directive';
import type { TextBlockContent } from '@models/block-content.model';

@Component({
	imports: [PortableTextDirective],
	template: `<article>
		@for (paragraph of content(); track $index) {
			<p [portableText]="paragraph" [classes]="classes()" cuentonetaPortableText></p>
		}
	</article>`,
})
class TestComponent {
	public readonly content = signal(storyMock.summary);
	public readonly classes = signal('test-class');
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

	describe('story content formatting', () => {
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

			const container = fixture.nativeElement.querySelector('article') as HTMLElement;
			const italicElements = container.querySelectorAll('i');
			const collectionTitle = Array.from(italicElements).some((el) => el.textContent === 'Ecos del Silencio');
			expect(collectionTitle).toBeTruthy();
		});
	});

	describe('media description formatting', () => {
		// La entrada va declarada acá y no tomada de un mock del corpus: lo que se prueba es cómo el parser
		// traduce marcas y `markDefs`, así que el Portable Text es el sujeto del test, no un accesorio.
		const markedUpBlock: TextBlockContent[] = [
			{
				_type: 'block',
				style: 'normal',
				_key: 'marked-up',
				markDefs: [{ _type: 'link', _key: 'link-1', href: 'https://www.youtube.com/@CanalMas' }],
				children: [
					{ _type: 'span', _key: 's1', marks: [], text: 'Transmitido por ' },
					{ _type: 'span', _key: 's2', marks: ['link-1'], text: 'Canal+' },
					{ _type: 'span', _key: 's3', marks: [], text: ' en su programa ' },
					{ _type: 'span', _key: 's4', marks: ['em'], text: 'Le Ble Chateau' },
				],
			},
		];

		it('should format links correctly', () => {
			component.content.set(markedUpBlock);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			const link = container.querySelector('a');

			expect(link).toBeTruthy();
			expect(link?.getAttribute('href')).toBe('https://www.youtube.com/@CanalMas');
			expect(link?.classList.contains('underline')).toBeTruthy();
			expect(link?.textContent).toBe('Canal+');
		});

		it('should format show title in italics', () => {
			component.content.set(markedUpBlock);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article') as HTMLElement;
			const italicElements = container.querySelectorAll('i');
			const showTitle = Array.from(italicElements).some((el) => el.textContent === 'Le Ble Chateau');
			expect(showTitle).toBeTruthy();
		});

		it('should handle line breaks', () => {
			component.content.set([
				{
					children: [
						{
							text: 'Line 1\nLine 2\nLine 3',
							marks: [],
							_type: '',
							_key: '',
						},
					],
					markDefs: [],
					_type: 'block',
					style: 'blockquote',
					_key: '',
				},
			]);
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article');
			expect(container.querySelectorAll('br').length).toEqual(2);
		});
	});

	describe('alignment marks', () => {
		// Las cuatro alineaciones se resuelven por un mapa de marca a clase de utilidad. Sin estos
		// casos, perder una entrada del mapa no rompería nada visible en la suite.
		it.each([
			['center', 'text-center'],
			['left', 'text-left'],
			['right', 'text-right'],
			['justify', 'text-justify'],
		])('traduce la marca %s a la clase %s en el host', (mark, expectedClass) => {
			const paragraph: TextBlockContent = {
				_type: 'block',
				_key: 'p1',
				style: 'normal',
				children: [{ _type: 'span', _key: 'a', text: 'Texto alineado', marks: [mark] }],
				markDefs: [],
			};
			component.content.set([paragraph]);
			component.classes.set('');
			fixture.detectChanges();

			const target = fixture.nativeElement.querySelector('p') as HTMLElement;
			expect(target).toHaveClass(expectedClass);
		});

		it('no agrega ninguna clase de alineación cuando la marca no es una de ellas', () => {
			const paragraph: TextBlockContent = {
				_type: 'block',
				_key: 'p1',
				style: 'normal',
				children: [{ _type: 'span', _key: 'a', text: 'Texto', marks: ['strong'] }],
				markDefs: [],
			};
			component.content.set([paragraph]);
			component.classes.set('');
			fixture.detectChanges();

			const target = fixture.nativeElement.querySelector('p') as HTMLElement;
			expect(target.className).toBe('');
		});
	});

	describe('class handling', () => {
		it('should apply custom classes', () => {
			component.classes.set('custom-class test-class');
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article') as HTMLElement;
			const classes = container.querySelectorAll('p');

			classes.forEach((el) => {
				expect(el).toHaveClass('custom-class');
				expect(el).toHaveClass('test-class');
			});
		});

		it('should handle class updates', () => {
			component.classes.set('initial-class');
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector('article') as HTMLElement;
			const classes = container.querySelectorAll('p');

			classes.forEach((el) => {
				expect(el).toHaveClass('initial-class');
			});

			component.classes.set('updated-class');
			fixture.detectChanges();

			classes.forEach((el) => {
				expect(el).not.toHaveClass('initial-class');
				expect(el).toHaveClass('updated-class');
			});
		});
	});

	describe('content updates', () => {
		it('should update content when signal changes', () => {
			component.content.set(storyMock.summary);
			fixture.detectChanges();

			let container = fixture.nativeElement.querySelector('article');
			expect(container).toHaveTextContent('El espejo del tiempo');

			component.content.set(storylistMock.description);
			fixture.detectChanges();

			container = fixture.nativeElement.querySelector('article');
			expect(container).not.toHaveTextContent('El espejo del tiempo');
		});
	});
});
