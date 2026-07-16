import { render, screen } from '@testing-library/angular';
import { BioSummaryCardComponent } from './bio-summary-card.component';
import { storyMock } from '@mocks/story.mock';
import type { Story } from '@models/story.model';

const country = storyMock.author.nationality.country;

const name = storyMock.author.name;
const nameRegex = new RegExp(`\\b${name}\\b`, 'iu');

// Para los asserts del author-teaser se usa una historia sin recursos: los recursos del autor
// también generan links que mencionan su nombre (p. ej. "Artículo de … en Wikipedia"), lo que
// haría ambigua la búsqueda del link por nombre.
const storyWithoutResources: Story = {
	...storyMock,
	resources: [],
	author: { ...storyMock.author, resources: [] },
};

describe('BioSummaryCardComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(BioSummaryCardComponent, {
			inputs: { story: storyMock },
		});

		expect(container).toBeInTheDocument();
	});

	it('should display the Biography', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyMock,
			},
		});

		expect(screen.getByText('(Chateauroux, 1948 - París, 1994) fue un escritor', { exact: false })).toBeInTheDocument();
	});

	it('should display the country flag image', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyMock,
			},
		});

		// La bandera es decorativa (alt vacío): se localiza por su testid, no por el nombre accesible.
		expect(screen.getByTestId('author-flag')).toBeInTheDocument();
	});

	it('should display the author name', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyWithoutResources,
			},
		});
		const authorTeaser = screen.getByRole('link', { name: nameRegex });
		expect(authorTeaser).toBeInTheDocument();
	});

	it('should display the country', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyWithoutResources,
			},
		});
		const authorTeaser = screen.getByRole('link', { name: nameRegex });

		expect(authorTeaser).toHaveTextContent(country);
	});

	it('should render the story resources when present', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyMock,
			},
		});

		const [resource] = storyMock.resources ?? [];
		const resourceLink = screen.getByRole('link', { name: resource.title });

		expect(resourceLink).toHaveAttribute('href', resource.url);
	});
});
