import { render, screen } from '@testing-library/angular';
import { DeferBlockState } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LiteraryWorksCardDeck } from './literary-works-card-deck';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';

const literaryWorks = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(0, 6);

describe('LiteraryWorksCardDeck', () => {
	const defaultProviders = [provideRouter([])];
	const defaultInputs = { literaryWorks, heading: 'Últimas novedades' };

	it('should render the component', async () => {
		const { container } = await render(LiteraryWorksCardDeck, {
			inputs: { ...defaultInputs, literaryWorks: literaryWorks.slice(0, 1) },
			providers: defaultProviders,
		});
		expect(container).toBeTruthy();
	});

	it('should render skeletons and then the cards', async () => {
		const { fixture } = await render(LiteraryWorksCardDeck, {
			inputs: defaultInputs,
			providers: defaultProviders,
		});
		const deferBlockFixture = (await fixture.getDeferBlocks())[0];

		await deferBlockFixture.render(DeferBlockState.Loading);
		expect(screen.getAllByTestId('skeleton')).toHaveLength(6);

		await deferBlockFixture.render(DeferBlockState.Complete);
		literaryWorks.forEach(({ title }) => {
			expect(screen.getByText(title)).toBeInTheDocument();
		});
		expect(screen.getAllByTestId('card')).toHaveLength(literaryWorks.length);
	});

	// La tarjeta enlaza a la ruta de lectura: es el único camino que la home ofrece hacia una obra desde
	// este bloque, y de él depende que la página emita enlaces internos.
	it('links every card to the reading route', async () => {
		const { fixture } = await render(LiteraryWorksCardDeck, {
			inputs: defaultInputs,
			providers: defaultProviders,
		});
		const deferBlockFixture = (await fixture.getDeferBlocks())[0];

		await deferBlockFixture.render(DeferBlockState.Complete);

		const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
		literaryWorks.forEach(({ slug }) => {
			expect(hrefs.some((href) => href?.startsWith(`/read/${slug}`))).toBe(true);
		});
	});

	describe('Encabezado parametrizado', () => {
		// Desde el primer render, sin esperar al bloque diferido: el encabezado es lo que da contexto a la
		// grilla mientras carga.
		it('should display the heading it receives', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, heading: 'Obras más leídas' },
				providers: defaultProviders,
			});

			expect(screen.getByRole('heading', { name: 'Obras más leídas', level: 2 })).toBeInTheDocument();
		});

		it('should point the action to the destination it receives', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: {
					...defaultInputs,
					action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
				},
				providers: defaultProviders,
			});

			expect(screen.getByRole('link', { name: 'Ver todo el catálogo de obras' })).toHaveAttribute(
				'href',
				'/literary-work',
			);
		});

		// El deck se puede montar en una página que ya anuncia la sección por su cuenta: ahí no debe
		// imponer un encabezado propio ni una región sin nombre.
		it('should render no header when it receives neither heading nor subtitle', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { literaryWorks },
				providers: defaultProviders,
			});

			expect(screen.queryAllByRole('heading')).toHaveLength(0);
			expect(screen.queryAllByRole('region')).toHaveLength(0);
		});

		it('should render the header when it only receives a subtitle', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { literaryWorks, subtitle: 'Explorá los textos más populares entre los lectores' },
				providers: defaultProviders,
			});

			expect(screen.getByText('Explorá los textos más populares entre los lectores')).toBeInTheDocument();
			expect(screen.queryAllByRole('heading')).toHaveLength(0);
		});

		it('should name its region after the heading', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, heading: 'Obras más leídas' },
				providers: defaultProviders,
			});

			expect(screen.getByRole('region', { name: 'Obras más leídas' })).toBeInTheDocument();
		});
	});
});
