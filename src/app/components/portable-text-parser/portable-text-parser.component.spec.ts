import { PortableTextParserComponent } from './portable-text-parser.component';
import { render } from '@testing-library/angular';
import { PortableTextParserService } from './portable-text-parser.service';
import { authorMock } from '../../mocks/author.mock';

describe('PortableTextParserComponent', () => {
	const setup = async () => {
		return await render(PortableTextParserComponent, {
			inputs: {
				paragraphs: authorMock.biography,
				classes: '',
				type: 'paragraph',
			},
			providers: [PortableTextParserService],
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();
		expect(container).toBeInTheDocument();
	});
});
