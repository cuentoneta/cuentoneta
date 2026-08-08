import { Author, AuthorProfile, AuthorTeaser } from '@models/author.model';
import { withoutKey } from './onoff/document/sanity-document.factory';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import onoffBiographyMdBody from './onoff/author/francois-onoff.biography.md?raw';
import { colaborativaTagMock } from './onoff-tags.mock';

export const authorMock: AuthorProfile = {
	_id: 'author_1',
	slug: 'francois-onoff',
	tags: [colaborativaTagMock],
	createdAt: '2021-12-28T00:00:00Z',
	updatedAt: '2024-05-20T10:30:00Z',
	nationality: {
		country: 'Francia',
		flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20.png',
	},
	resources: [
		{
			title: 'Artículo de François Onoff en Wikipedia',
			url: 'https://es.wikipedia.org/wiki/Francois_Onoff',
			resourceType: {
				slug: 'wikipedia',
				title: 'Wikipedia',
				description: 'Enlace a artículo de Wikipedia',
			},
		},
	],
	imageUrl: 'assets/img/mocks/author/francois-onoff.png',
	name: 'François Onoff',
	biography: markdownToSanitizedHtml(createMarkdown(onoffBiographyMdBody)),
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
};
// El autor tal como lo embebe una obra. Sin las fechas de ficha —que `Author` no declara porque solo las
// usa la página de perfil— y con las etiquetas vacías, que es lo que la proyección de obra devuelve.
export const embeddedAuthorMock: Author = { ...withoutKey(withoutKey(authorMock, 'createdAt'), 'updatedAt'), tags: [] };

export const authorTeaserMock: AuthorTeaser = {
	_id: 'author_1',
	slug: 'francois-onoff',
	tags: [colaborativaTagMock],
	nationality: {
		country: 'Francia',
		flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20.png',
	},
	resources: [],
	imageUrl: 'assets/img/mocks/author/francois-onoff.png',
	name: 'François Onoff',
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
};

// El teaser de autor tal como lo embebe el teaser de una obra: la proyección tampoco le trae etiquetas.
export const embeddedAuthorTeaserMock: AuthorTeaser = { ...authorTeaserMock, tags: [] };
