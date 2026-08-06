import { elTratadoDeLosPlaceresRawLiteraryWork } from './el-tratado-de-los-placeres.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import elTratadoDeLosPlaceresMdBody from './el-tratado-de-los-placeres.md?raw';
import elTratadoDeLosPlaceresEditorialNoteMd from './el-tratado-de-los-placeres.editorial-note.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';
import { elTratadoDeLosPlaceresStoryMock } from '../el-tratado-de-los-placeres.mock';

const elTratadoDeLosPlaceresBody = createMarkdown(elTratadoDeLosPlaceresMdBody);

export const elTratadoDeLosPlaceresLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-el-tratado-de-los-placeres',
	slug: elTratadoDeLosPlaceresStoryMock.slug,
	title: elTratadoDeLosPlaceresStoryMock.title,
	authors: [elTratadoDeLosPlaceresStoryMock.author],
	coverImage: elTratadoDeLosPlaceresStoryMock.coverImage,
	content: [
		createLiteraryWorkSection({
			position: 0,
			bodyHtml: markdownToSanitizedHtml(elTratadoDeLosPlaceresBody),
			readingTime: deriveSectionReadingTime(elTratadoDeLosPlaceresBody),
		}),
	],
	mediaSources: [],
	resources: elTratadoDeLosPlaceresStoryMock.resources,
	badLanguage: elTratadoDeLosPlaceresStoryMock.badLanguage,
	tags: toDomainTags(elTratadoDeLosPlaceresRawLiteraryWork.tags),
	originalPublication: elTratadoDeLosPlaceresStoryMock.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(elTratadoDeLosPlaceresEditorialNoteMd)),
	publishedAt: createIsoDateTime(elTratadoDeLosPlaceresStoryMock.publishedAt),
});
