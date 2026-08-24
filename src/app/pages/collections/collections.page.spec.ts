import { render, screen } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';

import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import CollectionsPage from './collections.page';

describe('CollectionsPage', () => {
	afterEach(() => restoreAllMocks());

	it('should announce the catalogue with a heading', async () => {
		await render(CollectionsPage);

		expect(screen.getByRole('heading', { level: 1, name: 'Colecciones' })).toBeInTheDocument();
	});

	it('should set the canonical URL for /collection', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await render(CollectionsPage);

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('collection'));
	});

	it('should keep itself out of the index while it has nothing to show', async () => {
		const robotsSpy = spyOn(HeadMetadataDirective.prototype, 'setRobots');

		await render(CollectionsPage);

		expect(robotsSpy).toHaveBeenCalledWith('noindex, follow');
	});
});
