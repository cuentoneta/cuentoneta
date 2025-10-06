import { render, screen } from '@testing-library/angular';
import { CardComponent } from './card.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { storyTeaserMock } from '../../mocks/story.mock';

describe('CardComponent', () => {
	let urlTree: UrlTree;

	const setup = async (overrides = {}) => {
		const urlSerializer = new DefaultUrlSerializer();
		urlTree = urlSerializer.parse('/test-route');

		return await render(CardComponent, {
			inputs: {
				route: urlTree,
				...overrides,
			},
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();
		expect(container).toBeInTheDocument();
	});

	it('should render the article element with correct classes', async () => {
		await setup();

		const article = screen.getByRole('article');
		expect(article).toBeInTheDocument();
		expect(article).toHaveClass(
			'card',
			'flex',
			'flex-col',
			'gap-2',
			'border-1',
			'border-solid',
			'border-primary-300',
			'p-5',
			'shadow-lg',
			'hover:shadow-lg-hover',
			'md:gap-4',
			'md:p-8',
		);
	});

	it('should render the router link with correct route', async () => {
		await setup();

		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/test-route');
	});

	it('should project content in header slot', async () => {
		await render(
			`
			<cuentoneta-card [route]="route">
				<div slot="header" data-testid="header-content">Header Content</div>
			</cuentoneta-card>
		`,
			{
				imports: [CardComponent],
				componentProperties: {
					route: urlTree || new DefaultUrlSerializer().parse('/test-route'),
				},
			},
		);

		const headerContent = screen.getByTestId('header-content');
		expect(headerContent).toBeInTheDocument();
		expect(headerContent).toHaveTextContent('Header Content');
	});

	it('should project content in content slot', async () => {
		await render(
			`
			<cuentoneta-card [route]="route">
				<div slot="content" data-testid="content-section">Main Content</div>
			</cuentoneta-card>
		`,
			{
				imports: [CardComponent],
				componentProperties: {
					route: urlTree || new DefaultUrlSerializer().parse('/test-route'),
				},
			},
		);

		const contentSection = screen.getByTestId('content-section');
		expect(contentSection).toBeInTheDocument();
		expect(contentSection).toHaveTextContent('Main Content');
	});

	it('should project content in footer slot', async () => {
		await render(
			`
			<cuentoneta-card [route]="route">
				<div slot="footer" data-testid="footer-content">Footer Content</div>
			</cuentoneta-card>
		`,
			{
				imports: [CardComponent],
				componentProperties: {
					route: urlTree || new DefaultUrlSerializer().parse('/test-route'),
				},
			},
		);

		const footerContent = screen.getByTestId('footer-content');
		expect(footerContent).toBeInTheDocument();
		expect(footerContent).toHaveTextContent('Footer Content');
	});

	it('should use default empty route when no route provided', async () => {
		await render(CardComponent, {
			inputs: {},
		});

		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
		// Verificar que el enlace tiene una ruta válida por defecto.
		expect(link).toHaveAttribute('href');
	});

	it('should render with story mock data', async () => {
		const urlSerializer = new DefaultUrlSerializer();
		const testRoute = urlSerializer.parse(`/story/${storyTeaserMock.slug}`);

		await render(
			`
			<cuentoneta-card [route]="route">
				<div slot="header" data-testid="story-header">{{ story.originalPublication }}</div>
				<div slot="content" data-testid="story-content">
					<h2>{{ story.title }}</h2>
					<p>{{ story.approximateReadingTime }} minutos de lectura</p>
				</div>
				<div slot="footer" data-testid="story-footer">{{ story.language }}</div>
			</cuentoneta-card>
		`,
			{
				imports: [CardComponent],
				componentProperties: {
					route: testRoute,
					story: storyTeaserMock,
				},
			},
		);

		// Verificar que se renderiza el enlace con la ruta correcta.
		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', `/story/${storyTeaserMock.slug}`);

		// Verificar contenido proyectado con datos del mock.
		const headerContent = screen.getByTestId('story-header');
		expect(headerContent).toBeInTheDocument();
		expect(headerContent).toHaveTextContent(storyTeaserMock.originalPublication);

		const contentSection = screen.getByTestId('story-content');
		expect(contentSection).toBeInTheDocument();
		expect(contentSection).toHaveTextContent(storyTeaserMock.title);
		expect(contentSection).toHaveTextContent('minutos de lectura');

		const footerContent = screen.getByTestId('story-footer');
		expect(footerContent).toBeInTheDocument();
		expect(footerContent).toHaveTextContent(storyTeaserMock.language);
	});
});
