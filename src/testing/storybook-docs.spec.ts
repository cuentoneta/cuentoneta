import { docsLink, docsMention, docsName, docsRef, kindId, type StoryDocsEntry } from './storybook-docs';

const collectionCover: StoryDocsEntry = { title: 'Componentes V3/CollectionCover' };
const collectionsPage: StoryDocsEntry = { title: 'Páginas/CollectionsPage' };

describe('kindId', () => {
	it('baja a minúsculas y convierte espacios y barras en guiones', () => {
		expect(kindId('Componentes V3/CollectionCover')).toBe('componentes-v3-collectioncover');
	});

	it('conserva los diacríticos en vez de transcribirlos, como hace Storybook', () => {
		expect(kindId('Páginas/CollectionsPage')).toBe('páginas-collectionspage');
	});

	it('colapsa rachas de puntuación y recorta los guiones de borde', () => {
		expect(kindId('Book & Morfi: Especial')).toBe('book-morfi-especial');
	});
});

describe('docsName', () => {
	it('publica el último segmento del title', () => {
		expect(docsName(collectionCover)).toBe('CollectionCover');
	});

	it('devuelve el title entero cuando no tiene sección', () => {
		expect(docsName({ title: 'FooterComponent' })).toBe('FooterComponent');
	});
});

describe('docsMention', () => {
	it('resalta el nombre sin enlazarlo', () => {
		expect(docsMention(collectionCover)).toBe('<strong>CollectionCover</strong>');
	});
});

describe('docsRef', () => {
	it('deriva el enlace y el nombre visible del mismo title', () => {
		expect(docsRef(collectionCover)).toBe(
			'<a href="./?path=/docs/componentes-v3-collectioncover--docs" target="_top"><strong>CollectionCover</strong></a>',
		);
	});

	it('mantiene el acento en el kind-id de una sección acentuada', () => {
		expect(docsRef(collectionsPage)).toContain('path=/docs/páginas-collectionspage--docs');
	});
});

describe('docsLink', () => {
	it('conserva el texto propio del enlace y deriva igual el destino', () => {
		expect(docsLink(collectionCover, 'la portada')).toBe(
			'<a href="./?path=/docs/componentes-v3-collectioncover--docs" target="_top"><strong>la portada</strong></a>',
		);
	});
});
