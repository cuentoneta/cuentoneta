import { onoffImageAssets } from '../../onoff-image-assets.mock';
import { embeddedAuthorMock } from '../../author.mock';
import { neronRawLiteraryWork } from './neron.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import neronMdBody from './neron.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';

const neronBody = createMarkdown(neronMdBody);

export const neronLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-neron',
	slug: neronRawLiteraryWork.slug,
	title: neronRawLiteraryWork.title,
	authors: [embeddedAuthorMock],
	coverImage: onoffImageAssets.neronCover.path,
	content: [
		createLiteraryWorkSection({
			position: 0,
			epigraphs: [],
			bodyHtml: markdownToSanitizedHtml(neronBody),
			readingTime: createReadingTime(neronRawLiteraryWork.content[0].readingTime ?? 0),
		}),
	],
	mediaSources: [],
	resources: [],
	badLanguage: neronRawLiteraryWork.badLanguage,
	tags: toDomainTags(neronRawLiteraryWork.tags),
	originalPublication: neronRawLiteraryWork.originalPublication,
	publishedAt: createIsoDateTime(neronRawLiteraryWork.publishedAt),
});
