import { PortableTextParserComponent } from './portable-text-parser.component';
import { render, RenderResult, screen } from '@testing-library/angular';
import { storyMock } from '../../mocks/story.mock';

describe('PortableTextParserComponent', () => {
	let component: RenderResult<PortableTextParserComponent>;

	const setupWithParagraphs = async (options = {}) => {
		return await render(PortableTextParserComponent, {
			inputs: {
				paragraphs: storyMock.media[0].description,
				classes: '',
				type: 'paragraph',
				...options,
			},
		});
	};

	it('should render the component', async () => {
		component = await setupWithParagraphs();
		expect(component.container).toBeInTheDocument();
		await component.rerender({
			inputs: { paragraphs: storyMock.media[0].description, classes: '', type: 'span' },
		});
		expect(component.container).toBeInTheDocument();
	});

	it('should render paragraphs', async () => {
		await setupWithParagraphs();
		expect(screen.getByRole('paragraph')).toBeInTheDocument();
	});

	it('should render spans', async () => {
		await setupWithParagraphs();
		await component.rerender({
			inputs: { paragraphs: storyMock.media[0].description, classes: '', type: 'span' },
		});
		expect(screen.getByText('Le Ble Chateau')).toBeInTheDocument();
	});

	it('should handle links correctly', async () => {
		await setupWithParagraphs();
		// Use Angular Testing Library functions to test the component
		expect(screen.getByRole('link')).toBeInTheDocument();
	});
});
