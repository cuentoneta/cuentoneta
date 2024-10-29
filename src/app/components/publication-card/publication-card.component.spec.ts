import { render } from '@testing-library/angular';
import { publicationMock } from '../../mocks/story.mock';
import { PublicationCardComponent } from './publication-card.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

describe('PublicationCardComponent', () => {
	let urlTree: UrlTree;

	const setup = async () => {
		const urlSerializer = new DefaultUrlSerializer();
		urlTree = urlSerializer.parse(
			'/story/la-gallina-degollada?navigation=storylist&navigationSlug=cuentos-de-terror-de-alberto-laiseca',
		);

		return await render(PublicationCardComponent, {
			inputs: {
				editionLabel: ' Episodio 1 ',
				publication: publicationMock,
				navigationRoute: urlTree,
			},
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();
		expect(container).toBeInTheDocument();
	});
});
