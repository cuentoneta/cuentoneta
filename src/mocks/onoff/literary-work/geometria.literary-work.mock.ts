import { onoffImageAssets } from '../../onoff-image-assets.mock';
import { embeddedAuthorMock } from '../../author.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createAttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import geometriaMdBody from './geometria.md?raw';
import geometriaEditorialNoteMd from './geometria.editorial-note.md?raw';
import { geometriaEpigraphReference, geometriaEpigraphText, geometriaSectionTitle } from './geometria.epigraph';
import { toDomainTags } from '../../onoff-tags.mock';
import { geometriaRawLiteraryWork } from './geometria.literary-work.raw.mock';
import { geometriaMediaMock } from '../media/geometria.media.mock';

const geometriaBody = createMarkdown(geometriaMdBody);

export const geometriaEpigraphMock = createAttributedText({
	text: markdownToSanitizedHtml(createMarkdown(geometriaEpigraphText)),
	reference: markdownToSanitizedHtml(createMarkdown(geometriaEpigraphReference)),
});

export const geometriaLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-geometria',
	slug: geometriaRawLiteraryWork.slug,
	title: geometriaRawLiteraryWork.title,
	authors: [embeddedAuthorMock],
	coverImage: onoffImageAssets.geometriaCover.path,
	content: [
		createLiteraryWorkSection({
			position: 0,
			title: createSectionTitle(geometriaSectionTitle),
			epigraphs: [geometriaEpigraphMock],
			bodyHtml: markdownToSanitizedHtml(geometriaBody),
			readingTime: createReadingTime(geometriaRawLiteraryWork.content[0].readingTime ?? 0),
		}),
	],
	mediaSources: geometriaMediaMock,
	resources: [],
	badLanguage: geometriaRawLiteraryWork.badLanguage,
	tags: toDomainTags(geometriaRawLiteraryWork.tags),
	originalPublication: geometriaRawLiteraryWork.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(geometriaEditorialNoteMd)),
	publishedAt: createIsoDateTime(geometriaRawLiteraryWork.publishedAt),
});
