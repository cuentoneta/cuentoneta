import { onoffImageAssets } from '../../onoff-image-assets.mock';
import { embeddedAuthorMock } from '../../author.mock';
import { losPeldanosRawLiteraryWork } from './los-peldanos.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import losPeldanosMdBody from './los-peldanos.md?raw';
import losPeldanosEditorialNoteMd from './los-peldanos.editorial-note.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';

const losPeldanosBody = createMarkdown(losPeldanosMdBody);

export const losPeldanosLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-los-peldanos',
	slug: losPeldanosRawLiteraryWork.slug,
	title: losPeldanosRawLiteraryWork.title,
	authors: [embeddedAuthorMock],
	coverImage: onoffImageAssets.losPeldanosCover.path,
	content: [
		createLiteraryWorkSection({
			position: 0,
			epigraphs: [],
			bodyHtml: markdownToSanitizedHtml(losPeldanosBody),
			readingTime: createReadingTime(losPeldanosRawLiteraryWork.content[0].readingTime ?? 0),
		}),
	],
	mediaSources: [],
	resources: [],
	badLanguage: losPeldanosRawLiteraryWork.badLanguage,
	tags: toDomainTags(losPeldanosRawLiteraryWork.tags),
	originalPublication: losPeldanosRawLiteraryWork.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(losPeldanosEditorialNoteMd)),
	publishedAt: createIsoDateTime(losPeldanosRawLiteraryWork.publishedAt),
});
