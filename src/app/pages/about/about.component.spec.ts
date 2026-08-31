import { render } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';

import AboutComponent from './about.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideContributorApiMock } from '../../providers/contributor.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

describe('AboutComponent', () => {
	const setup = async () => {
		return await render(AboutComponent, {
			providers: [provideHttpClient(), provideHttpClientTesting(), provideContributorApiMock()],
		});
	};

	afterEach(() => restoreAllMocks());

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});

	it('should set the canonical URL for /about via buildCanonicalUrl', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await setup();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('about'));
	});

	// La página es la única superficie de runtime que enlaza al repositorio. Las URLs del repositorio
	// previo a la organización resuelven por redirección, así que una regresión acá no se vería
	// navegando: solo se nota el día que GitHub deje de redirigir.
	it('no enlaza al repositorio previo a la organización', async () => {
		const { container } = await setup();

		const destinos = Array.from(container.querySelectorAll('a[href*="github.com"]')).map((anchor) =>
			anchor.getAttribute('href'),
		);

		expect(destinos.length).toBeGreaterThan(0);
		expect(destinos.every((href) => href?.startsWith('https://github.com/cuentoneta/cuentoneta'))).toBe(true);
	});
});
