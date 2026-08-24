import type { Author, AuthorTeaser } from '@models/author.model';
import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { createLiteraryWorkExcerpt } from '@models/literary-work-excerpt.model';
import type { LiteraryWorkRepository } from './literary-work.repository';

// Fake de almacenamiento: sustituye el content lake por una lista en memoria. El listado por autor
// deriva sus teasers de las obras cargadas, para que no puedan discrepar de lo que devuelve
// fetchBySlug — misma doctrina del doble de colección.
export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly literaryWorks: ReadonlyArray<LiteraryWork>;

	constructor(literaryWorks: ReadonlyArray<LiteraryWork> = []) {
		this.literaryWorks = literaryWorks;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.literaryWorks.find((literaryWork) => literaryWork.slug === slug) ?? null;
	}

	public async fetchByAuthorSlug(slug: string): Promise<LiteraryWorkTeaser[]> {
		return this.literaryWorks
			.filter((literaryWork) => literaryWork.authors.some((author) => author.slug === slug))
			.map(toTeaser);
	}
}

// La vista de teaser angosta lo que transporta: sin biografía ni carga de los medios, y con el
// extracto tomado de la sección de apertura entera — el recorte es heurística de la query real, no
// una invariante del dominio.
function toTeaser(literaryWork: LiteraryWork): LiteraryWorkTeaser {
	return Object.freeze({
		_id: literaryWork._id,
		slug: literaryWork.slug,
		title: literaryWork.title,
		coverImage: literaryWork.coverImage,
		totalReadingTime: literaryWork.totalReadingTime,
		sectionCount: literaryWork.sectionCount,
		tags: literaryWork.tags,
		mediaSources: literaryWork.mediaSources.map(({ type, title }) => ({ type, title })),
		authors: literaryWork.authors.map(toAuthorTeaser),
		excerpt: createLiteraryWorkExcerpt({
			title: literaryWork.content[0].title,
			bodyHtml: literaryWork.content[0].bodyHtml,
		}),
	});
}

function toAuthorTeaser(author: Author): AuthorTeaser {
	return {
		_id: author._id,
		slug: author.slug,
		name: author.name,
		imageUrl: author.imageUrl,
		nationality: author.nationality,
		tags: author.tags,
		bornOn: author.bornOn,
		diedOn: author.diedOn,
		bornOnYear: author.bornOnYear,
		diedOnYear: author.diedOnYear,
		resources: [],
	};
}
