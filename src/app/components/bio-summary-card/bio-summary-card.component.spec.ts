import { render } from '@testing-library/angular';

import { BioSummaryCardComponent } from './bio-summary-card.component';
import { Author } from 'src/app/models/author.model';
import { Story } from '@models/story.model';

const mockAuthor: Author = {
  id: 0,
  name: 'Estudios Gativideo',
  imageUrl: 'https://gativideo.com/image.png',
  nationality: {
    country: 'Argentina',
    flag: 'AR',
  },
  fullBioUrl: 'https://gativideo.com',
};

const mockStory: Story = {
    id: 0,
    title: 'El Marajá de San Telmo',
    slug: 'el-maraja-de-san-telmo',
    approximateReadingTime: 5,
    author: mockAuthor,
    originalLink: 'https://gativideo.com/historia-de-la-pelicula',
    videoUrl: 'https://gativideo.com/video.mp4',
    badLanguage: false,
    prologues: [],
    summary: 'Arranca con "Fanfare for the Common Man" y la próxima canción es "Silhouette" de Kenny G.',
    paragraphs: [
        'El presente Video-Cassette se vende para uso personal o doméstico exclusivamente, todos los demás derechos quedan reservados',
        'Cualquier divulgación total o parcial de la obra, sea a través de copias, edición, adición, exhibición, difusión y/o emisión de difusión queda expresamente prohibida.'
    ]
}

describe('BioSummaryCardComponent', () => {
  it('should create', async () => {
    const component = await render(BioSummaryCardComponent, {
      componentProperties: { story: mockStory },
    });

    expect(component).toBeTruthy();
  });
});
