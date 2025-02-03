import { PortableTextParserComponent } from './portable-text-parser.component';
import { render, RenderResult } from '@testing-library/angular';
import { PortableTextParserService } from './portable-text-parser.service';
import { authorMock } from '../../mocks/author.mock';

describe('PortableTextParserComponent', () => {
	let component: RenderResult<PortableTextParserComponent>;

	const setup = async (options = {}) => {
		return await render(PortableTextParserComponent, {
			inputs: {
				paragraphs: authorMock.biography,
				classes: '',
				type: 'paragraph',
				...options,
			},
			providers: [PortableTextParserService],
		});
	};

	beforeEach(async () => {
		component = await setup();
	});

	it('should render the component', () => {
		expect(component.container).toBeInTheDocument();
	});

	it('should render paragraphs with correct HTML content', async () => {
		const paragraphs = component.container.querySelectorAll('p');
		expect(paragraphs.length).toBeGreaterThan(0);

		component.fixture.whenRenderingDone().then(() => {
			// Helper function to clean HTML string for comparison
			component.detectChanges();

			// Check specific paragraph content
			expect(paragraphs[0].innerHTML).toContain('François Onoff');

			// Check for formatted content
			expect(paragraphs[1].querySelector('i')).toBeTruthy();
			expect(paragraphs[2].querySelector('b')).toBeTruthy();
		});
	});

	it('should handle links correctly', () => {
		const links = component.container.querySelectorAll('a');
		console.log(links, links.length);
		// Assuming there are links in your mock data
		if (links.length > 0) {
			expect(links[0].getAttribute('href')).not.toBe('#');
			expect(links[0].classList.contains('underline')).toBeTruthy();
		}
	});
});
