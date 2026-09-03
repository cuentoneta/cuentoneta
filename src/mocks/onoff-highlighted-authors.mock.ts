import type { HighlightedAuthor } from '@models/landing-page-content.model';
import { embeddedAuthorTeaserMock } from './author.mock';
import { cuentoTagMock, dramaPsicologicoTagMock } from './onoff-tags.mock';
import { onoffRawHighlightedAuthorsMock } from './onoff-raw-landing-page.mock';

// El autor viaja como teaser con su lista de etiquetas vacía —es lo que devuelve el mapper de teaser en
// toda vista— y las del destacado van en el wrapper. El conteo sale del crudo generado, así que sigue al
// corpus si cambia la cantidad de obras que lo referencian.
const [canonicalRaw] = onoffRawHighlightedAuthorsMock;

export const onoffHighlightedAuthorsMock: HighlightedAuthor[] = [
	{
		author: embeddedAuthorTeaserMock,
		tags: [cuentoTagMock, dramaPsicologicoTagMock],
		storyCount: canonicalRaw.storyCount,
	},
];

// Los tags de autor se derivan de los editoriales de las obras, y esa reconciliación todavía no corre:
// una grilla sin etiquetas no es un borde sino el estado con el que la sección sale a producción.
export const onoffUntaggedHighlightedAuthor: HighlightedAuthor = { ...onoffHighlightedAuthorsMock[0], tags: [] };

// El corpus modela un solo autor, así que poblar la grilla exige derivar variantes. Se varía la
// identidad y no solo la cantidad para que un spec pueda afirmar **cuáles** entradas se renderizaron:
// con seis copias idénticas, contar tarjetas no distingue una grilla correcta de una que repite la misma.
export function onoffHighlightedAuthorsOfLength(count: number): HighlightedAuthor[] {
	const [base] = onoffHighlightedAuthorsMock;

	return Array.from({ length: count }, (_, index) => ({
		...base,
		author: {
			...base.author,
			_id: `${base.author._id}-${index + 1}`,
			slug: `${base.author.slug}-${index + 1}`,
			name: `${base.author.name} ${index + 1}`,
		},
	}));
}
