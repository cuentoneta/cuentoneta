import { onoffImageAssets } from '../../onoff-image-assets.mock';
import { embeddedAuthorMock } from '../../author.mock';
import { lasEscalerasRawLiteraryWork } from './las-escaleras.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import lasEscalerasMdBody from './las-escaleras.md?raw';
import lasEscalerasEditorialNoteMd from './las-escaleras.editorial-note.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';
import { lasEscalerasMediaMock } from '../media/las-escaleras.media.mock';

const lasEscalerasBody = createMarkdown(lasEscalerasMdBody);

export const lasEscalerasLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-las-escaleras',
	slug: lasEscalerasRawLiteraryWork.slug,
	title: lasEscalerasRawLiteraryWork.title,
	authors: [embeddedAuthorMock],
	coverImage: onoffImageAssets.lasEscalerasCover.path,
	content: [
		createLiteraryWorkSection({
			position: 0,
			epigraphs: [],
			bodyHtml: markdownToSanitizedHtml(lasEscalerasBody),
			readingTime: createReadingTime(lasEscalerasRawLiteraryWork.content[0].readingTime ?? 0),
		}),
	],
	mediaSources: lasEscalerasMediaMock,
	resources: [],
	badLanguage: lasEscalerasRawLiteraryWork.badLanguage,
	tags: toDomainTags(lasEscalerasRawLiteraryWork.tags),
	originalPublication: lasEscalerasRawLiteraryWork.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(lasEscalerasEditorialNoteMd)),
	publishedAt: createIsoDateTime(lasEscalerasRawLiteraryWork.publishedAt),
});
