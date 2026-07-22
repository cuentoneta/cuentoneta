import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkEpigraph, createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createChapterTitle } from '@models/chapter-title.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import { authorMock } from '@mocks/author.mock';

export const literaryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'literaryWork_onoff_1',
	slug: 'la-vigilia-de-onoff',
	title: 'La vigilia de Onoff',
	authors: [authorMock],
	coverImage: '',
	content: [
		createLiteraryWorkSection({
			position: 0,
			chapterTitle: createChapterTitle('La espera'),
			epigraphs: [
				createLiteraryWorkEpigraph({
					text: createSanitizedHtml('<p><em>El insomnio es una lucidez que nadie pidió.</em></p>'),
					reference: createSanitizedHtml('<p><strong>Anónimo</strong>, refranero apócrifo</p>'),
				}),
			],
			bodyHtml: createSanitizedHtml(
				'<p>François esperaba el amanecer con <strong>una taza fría</strong> entre las manos.</p>',
			),
			readingTime: createReadingTime(2),
		}),
	],
	mediaSources: [],
	resources: [],
	badLanguage: false,
	tags: [],
	originalPublication: 'Cuadernos del Loira, 1987',
	publishedAt: createIsoDateTime('2026-07-01T12:00:00Z'),
});
