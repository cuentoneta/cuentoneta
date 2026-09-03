import { onoffImageAssets } from '../../onoff-image-assets.mock';
import { embeddedAuthorMock } from '../../author.mock';
import { elTratadoDeLosPlaceresRawLiteraryWork } from './el-tratado-de-los-placeres.literary-work.raw.mock';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime } from '@models/reading-time.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import elTratadoDeLosPlaceresMdBody from './el-tratado-de-los-placeres.md?raw';
import elTratadoDeLosPlaceresEditorialNoteMd from './el-tratado-de-los-placeres.editorial-note.md?raw';
import { toDomainTags } from '../../onoff-tags.mock';

const elTratadoDeLosPlaceresBody = createMarkdown(elTratadoDeLosPlaceresMdBody);

export const elTratadoDeLosPlaceresLiteraryWorkMock: LiteraryWork = createLiteraryWork({
	_id: 'onoff-literary-work-el-tratado-de-los-placeres',
	slug: elTratadoDeLosPlaceresRawLiteraryWork.slug,
	title: elTratadoDeLosPlaceresRawLiteraryWork.title,
	authors: [embeddedAuthorMock],
	coverImage: onoffImageAssets.elTratadoDeLosPlaceresCover.path,
	content: [
		createLiteraryWorkSection({
			position: 0,
			epigraphs: [],
			bodyHtml: markdownToSanitizedHtml(elTratadoDeLosPlaceresBody),
			readingTime: createReadingTime(elTratadoDeLosPlaceresRawLiteraryWork.content[0].readingTime ?? 0),
		}),
	],
	mediaSources: [],
	resources: [],
	badLanguage: elTratadoDeLosPlaceresRawLiteraryWork.badLanguage,
	tags: toDomainTags(elTratadoDeLosPlaceresRawLiteraryWork.tags),
	originalPublication: elTratadoDeLosPlaceresRawLiteraryWork.originalPublication,
	editorialNote: markdownToSanitizedHtml(createMarkdown(elTratadoDeLosPlaceresEditorialNoteMd)),
	publishedAt: createIsoDateTime(elTratadoDeLosPlaceresRawLiteraryWork.publishedAt),
});
