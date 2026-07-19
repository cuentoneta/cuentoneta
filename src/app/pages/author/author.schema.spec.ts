import { authorMock } from '@mocks/author.mock';

import { assertValidJsonLd } from '../../../../e2e/_utils/json-ld-validation';
import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';

describe('author schema builders', () => {
	it('buildAuthorProfilePageSchema emite un ProfilePage schema.org válido', async () => {
		await expect(assertValidJsonLd(buildAuthorProfilePageSchema(authorMock, websiteUrl))).resolves.toBeUndefined();
	});

	it('el ProfilePage envuelve al Person autor como mainEntity', () => {
		expect(buildAuthorProfilePageSchema(authorMock, websiteUrl)).toMatchObject({
			'@type': 'ProfilePage',
			mainEntity: { '@type': 'Person', name: authorMock.name },
		});
	});

	it('buildAuthorBreadcrumb emite un BreadcrumbList schema.org válido', async () => {
		await expect(assertValidJsonLd(buildAuthorBreadcrumb(authorMock, websiteUrl))).resolves.toBeUndefined();
	});
});
