import type { LandingPageContentQueryResult } from '@sanity-types';
import { onoffRawLandingPageMock as generatedLandingPage } from './onoff/landing-page/landing-page.raw.mock';

export const onoffRawLandingPageMock: NonNullable<LandingPageContentQueryResult> = generatedLandingPage;

// La campaña no tiene agregador propio porque no tiene query propia: es sub-proyección de la de landing, y
// separarlas dejaría un módulo cuyo valor sale entero de este.
export const onoffRawContentCampaignsMock = onoffRawLandingPageMock.campaigns;

type RawHighlightedAuthors = NonNullable<LandingPageContentQueryResult>['highlightedAuthors'];
type RawHighlightedAuthor = RawHighlightedAuthors[number];

export const onoffRawHighlightedAuthorsMock: RawHighlightedAuthors = onoffRawLandingPageMock.highlightedAuthors;

// Escenarios de borde, construidos por spread sobre el canon para que cambien con él.

// El corpus tiene un solo autor, así que las entradas se distinguen por identidad para que el recorte
// pueda afirmarse sobre cuáles sobreviven y no solo sobre cuántas.
export const overflowingRawHighlightedAuthors: RawHighlightedAuthor[] = Array.from({ length: 7 }, (_, index) => {
	const canonical = onoffRawHighlightedAuthorsMock[0];
	return { ...canonical, author: { ...canonical.author, _id: `${canonical.author._id}-${index}` } };
});

// El canon repite un slug entre las dos fuentes, pero con el mismo contenido, así que no distingue
// cuál de las dos sobrevive al descarte. Acá la derivada difiere en el título para que sí lo haga.
export const divergentDuplicateRawHighlightedAuthor: RawHighlightedAuthor = (() => {
	const canonical = onoffRawHighlightedAuthorsMock[0];
	const [shared] = canonical.additionalTags;

	return {
		...canonical,
		author: {
			...canonical.author,
			tags: canonical.author.tags.map((tag) => (tag.slug === shared.slug ? { ...tag, title: 'Título derivado' } : tag)),
		},
	};
})();

export const untaggedRawHighlightedAuthor: RawHighlightedAuthor = {
	...onoffRawHighlightedAuthorsMock[0],
	additionalTags: [],
	author: { ...onoffRawHighlightedAuthorsMock[0].author, tags: [] },
};
