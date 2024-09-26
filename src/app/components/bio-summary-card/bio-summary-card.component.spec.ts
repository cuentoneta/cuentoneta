import { render, screen } from '@testing-library/angular';
import { BioSummaryCardComponent } from './bio-summary-card.component';
import { storyMock } from 'src/app/mocks/story.mock';

const country = storyMock.author.nationality.country;
const countryRegex = new RegExp(`\\b${country}\\b`, 'i');

const name = storyMock.author.name;
const nameRegex = new RegExp(`\\b${name}\\b`, 'iu');

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

	it('should display the country image text', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyMock,
			},
		});

		const countryImage = screen.getByRole('img', {
			name: countryRegex,
		});

		expect(countryImage).toBeInTheDocument();
	});

	it('should display the author name', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyMock,
			},
		});
		const authorTeaser = screen.getByRole('link', { name: nameRegex });
		expect(authorTeaser).toBeInTheDocument();
	});

	it('should display the country', async () => {
		await render(BioSummaryCardComponent, {
			inputs: {
				story: storyMock,
			},
		});
		const authorTeaser = screen.getByRole('link', { name: nameRegex });

		expect(authorTeaser).toHaveTextContent(country);
	});
});
