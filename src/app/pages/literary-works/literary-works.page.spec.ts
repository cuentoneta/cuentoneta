import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { restoreAllMocks, spyOn } from '@test-utils';

import LiteraryWorksPage from './literary-works.page';
import { AppRoutes } from '../../app.routes';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

describe('LiteraryWorksPage', () => {
	afterEach(() => restoreAllMocks());

	const renderPage = () => render(LiteraryWorksPage, { providers: [provideRouter([])] });

	it('should headline the catalogue of literary works', async () => {
		await renderPage();

		expect(screen.getByRole('heading', { level: 1, name: 'Obras' })).toBeInTheDocument();
	});

	it('should point the canonical URL at its own route', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await renderPage();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.LiteraryWork));
	});

	// El opt-out es transitorio y dura lo que dure el listado sin obras: ofrecer al indexado una página
	// que todavía no lista nada gasta rastreo en una URL sin contenido.
	it('should opt out of indexing while it lists no work', async () => {
		const robotsSpy = spyOn(HeadMetadataDirective.prototype, 'setRobots');

		await renderPage();

		expect(robotsSpy).toHaveBeenCalledWith('noindex, follow');
	});
});
