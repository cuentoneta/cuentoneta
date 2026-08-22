import { PortableTextParserComponent } from './portable-text-parser.component';
import type { RenderResult } from '@testing-library/angular';
import { render, screen, within } from '@testing-library/angular';
import { portableTextWithListsMock, simpleOrderedListMock } from '@mocks/portable-text-with-lists.mock';
import type { TextBlockContent } from '@models/block-content.model';

describe('PortableTextParserComponent', () => {
	let component: RenderResult<PortableTextParserComponent>;

	// La entrada por defecto va declarada acá y no tomada de un mock del corpus: lo que se prueba es cómo
	// el parser traduce marcas y `markDefs`, así que el Portable Text es el sujeto del test.
	const markedUpParagraph: TextBlockContent[] = [
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

	const setupWithParagraphs = async (paragraphs = markedUpParagraph, options = {}) => {
		return await render(PortableTextParserComponent, {
			inputs: {
				paragraphs,
				classes: '',
				...options,
			},
		});
	};

	it('should render the component', async () => {
		component = await setupWithParagraphs();
		expect(component.container).toBeInTheDocument();
	});

	it('should render paragraphs', async () => {
		await setupWithParagraphs();
		expect(screen.getByRole('paragraph')).toBeInTheDocument();
	});

	it('should render spans', async () => {
		await setupWithParagraphs();
		expect(screen.getByText('Le Ble Chateau')).toBeInTheDocument();
	});

	it('should handle links correctly', async () => {
		await setupWithParagraphs();
		expect(screen.getByRole('link')).toBeInTheDocument();
	});

	describe('Unordered lists', () => {
		it('should render unordered lists correctly', async () => {
			component = await setupWithParagraphs(portableTextWithListsMock);
			// Obtiene todos los elementos de lista disponibles en el documento
			const lists = screen.getAllByRole('list');
			expect(lists.length).toBeGreaterThan(0);

			// Verifica que exista al menos una lista sin ordenar (ul)
			const unorderedLists = lists.filter((list) => list.tagName.toLowerCase() === 'ul');
			expect(unorderedLists.length).toBeGreaterThan(0);
		});

		it('should render list items within unordered lists', async () => {
			component = await setupWithParagraphs(portableTextWithListsMock);
			// Obtiene todos los elementos de lista sin ordenar
			const lists = screen.getAllByRole('list');
			const unorderedLists = lists.filter((list) => list.tagName.toLowerCase() === 'ul');

			// Verifica que exista al menos una lista sin ordenar
			expect(unorderedLists.length).toBeGreaterThan(0);

			// Verifica que todos los elementos listitem estén dentro de listas sin ordenar
			unorderedLists.forEach((ulElement) => {
				// Obtiene los elementos listitem dentro de cada lista sin ordenar
				const listItemsInUl = within(ulElement).getAllByRole('listitem');
				expect(listItemsInUl.length).toBeGreaterThan(0);

				// Verifica que cada elemento listitem esté contenido dentro de la lista sin ordenar
				listItemsInUl.forEach((item) => {
					expect(ulElement).toContainElement(item);
				});
			});

			// Verifica que el contenido de texto específico esté en el documento
			expect(screen.getByText(/Ser miembro del servidor de/)).toBeInTheDocument();
		});

		it('should group consecutive bullet items into a single list', async () => {
			component = await setupWithParagraphs(portableTextWithListsMock);
			// Obtiene todos los elementos de lista disponibles en el documento
			const lists = screen.getAllByRole('list');
			const unorderedLists = lists.filter((list) => list.tagName.toLowerCase() === 'ul');

			// Verifica que exista al menos una lista sin ordenar
			expect(unorderedLists.length).toBeGreaterThan(0);

			if (unorderedLists.length > 0) {
				// Obtiene los elementos listitem dentro de la primera lista sin ordenar
				const firstUlItems = within(unorderedLists[0]).getAllByRole('listitem');
				expect(firstUlItems.length).toBeGreaterThan(0);

				// Verifica que todos los elementos listitem están dentro de la primera lista
				firstUlItems.forEach((item) => {
					expect(unorderedLists[0]).toContainElement(item);
				});
			}
		});
	});

	describe('Ordered lists', () => {
		it('should render ordered lists correctly', async () => {
			component = await setupWithParagraphs(simpleOrderedListMock);
			// Obtiene todos los elementos de lista del documento
			const lists = screen.getAllByRole('list');

			// Verifica que exista al menos una lista ordenada (ol)
			const orderedLists = lists.filter((list) => list.tagName.toLowerCase() === 'ol');
			expect(orderedLists.length).toBeGreaterThan(0);
		});

		it('should render list items within ordered lists', async () => {
			component = await setupWithParagraphs(simpleOrderedListMock);
			// Obtiene todos los elementos de lista ordenada
			const lists = screen.getAllByRole('list');
			const orderedLists = lists.filter((list) => list.tagName.toLowerCase() === 'ol');

			// Verifica que exista al menos una lista ordenada
			expect(orderedLists.length).toBeGreaterThan(0);

			// Verifica que todos los elementos listitem estén dentro de listas ordenadas
			orderedLists.forEach((olElement) => {
				// Obtiene los elementos listitem dentro de cada lista ordenada
				const listItemsInOl = within(olElement).getAllByRole('listitem');
				expect(listItemsInOl.length).toBeGreaterThan(0);

				// Verifica que cada elemento listitem esté contenido dentro de la lista ordenada
				listItemsInOl.forEach((item) => {
					expect(olElement).toContainElement(item);
				});
			});

			// Verifica que los textos específicos estén presentes
			expect(screen.getByText('Plan your story structure')).toBeInTheDocument();
			expect(screen.getByText('Develop your characters')).toBeInTheDocument();
			expect(screen.getByText('Write the first draft')).toBeInTheDocument();
		});

		it('should group consecutive number items into a single list', async () => {
			component = await setupWithParagraphs(simpleOrderedListMock);
			// Obtiene todos los elementos de lista del documento
			const lists = screen.getAllByRole('list');
			const orderedLists = lists.filter((list) => list.tagName.toLowerCase() === 'ol');

			// Verifica que exista al menos una lista ordenada
			expect(orderedLists.length).toBeGreaterThan(0);

			if (orderedLists.length > 0) {
				// Obtiene los elementos listitem dentro de la primera lista ordenada
				const firstOlItems = within(orderedLists[0]).getAllByRole('listitem');
				expect(firstOlItems.length).toBe(3);

				// Verifica que todos los elementos listitem están dentro de la primera lista ordenada
				firstOlItems.forEach((item) => {
					expect(orderedLists[0]).toContainElement(item);
				});
			}
		});
	});

	describe('Mixed content', () => {
		it('should handle mixed paragraphs and lists correctly', async () => {
			component = await setupWithParagraphs(portableTextWithListsMock);
			// Obtiene todos los párrafos y listas del documento
			const paragraphs = screen.getAllByRole('paragraph');
			const lists = screen.getAllByRole('list');

			// Verifica que existan tanto párrafos como listas
			expect(paragraphs.length).toBeGreaterThan(0);
			expect(lists.length).toBeGreaterThan(0);
		});

		it('should render headings separately from lists', async () => {
			component = await setupWithParagraphs(portableTextWithListsMock);

			// Verifica que los textos de encabezado estén presentes en el documento
			expect(screen.getByText(/Información pertinente para participar/)).toBeInTheDocument();
			expect(screen.getByText(/Requisitos generales:/)).toBeInTheDocument();
		});
	});
});
