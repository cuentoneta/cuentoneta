import { render, screen } from '@testing-library/angular';
import { BioSummaryCardComponent } from './bio-summary-card.component';
import { storyMock } from '@mocks/story.mock';
import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

const country = storyMock.author.nationality.country;
const countryRegex = new RegExp(`\\b${country}\\b`, 'i');

const name = storyMock.author.name;
const nameRegex = new RegExp(`\\b${name}\\b`, 'iu');
@NgModule({
	declarations: [],
	exports: [],
})
class MockA11yTooltipModule {}

const setupTestBed = (testbed: any) => {
	(testbed as typeof TestBed).configureTestingModule({}).overrideComponent(BioSummaryCardComponent, {
		set: {
			imports: [MockA11yTooltipModule],
		},
	});
};
describe('BioSummaryCardComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(BioSummaryCardComponent, {
			inputs: { story: storyMock },
			configureTestBed: setupTestBed,
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
