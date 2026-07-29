import type { SanityClient } from '@sanity/client';
import type { LiteraryWorkBySlugQueryResult, LiteraryWorkSectionBySlugQueryResult } from '@sanity-types';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import {
	createLiteraryWorkEpigraph,
	createLiteraryWorkSection,
	type LiteraryWorkEpigraph,
	type LiteraryWorkSection,
} from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime, type ReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import {
	applyReadingTimeMaterialization,
	buildReadingTimeMaterialization,
	type ReadingTimeMaterializationInput,
} from '@models/reading-time-materialization.model';
import { mapAuthor, mapResources, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaSources } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { environment } from '../../_helpers/environment';
import { literaryWorkBySlugQuery, literaryWorkSectionBySlugQuery } from '../../_queries/literary-work.query';
import { LiteraryWorkSectionNotFoundError } from './literary-work.errors';
import { projectSingleSection, type LiteraryWorkRepository } from './literary-work.repository';

// Shape crudo de Sanity (query full y de proyección de sección). El adaptador Sanity es la única frontera
// que los conoce: traduce a dominio puertas adentro y expone solo `LiteraryWork` — el service recibe
// dominio ya en el formato que necesita, sin una capa de mappers aparte.
type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
type SanityLiteraryWorkSectionProjection = NonNullable<LiteraryWorkSectionBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityLiteraryWorkEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];
type SanityLiteraryWorkMetadata = Pick<
	SanityLiteraryWork,
	| '_id'
	| 'slug'
	| 'title'
	| 'authors'
	| 'coverImage'
	| 'mediaSources'
	| 'resources'
	| 'badLanguage'
	| 'tags'
	| 'originalPublication'
	| 'publishedAt'
>;

// Coalescing de materialización concurrente por documento. El write-on-read se dispara desde el endpoint
// de lectura público, así que una ráfaga anónima sobre la misma obra sin materializar podría lanzar N
// escrituras en la ventana previa a que `setIfMissing` cierre el campo. Este registro vive a nivel de
// módulo (el repository se instancia por request, así que un `Set` de instancia no coalescería entre
// requests): mientras una materialización está en vuelo, las demás sirven lo derivado sin re-escribir.
// La escritura ya es idempotente (`setIfMissing`); esto solo acota el consumo de cuota.
const inFlightMaterializations = new Set<string>();

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	// Seam de `client` para el spy en tests; `canPersist` distingue el deploy con token de escritura
	// (materializa) del read-only (degrada: computa sin persistir) — ver LITERARY_WORK_DESIGN.md §5.
	constructor(
		private readonly client: SanityClient = sanityClient,
		private readonly canPersist: boolean = Boolean(environment.sanity.token),
	) {}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = await this.client.fetch(literaryWorkBySlugQuery, { slug });
		if (!raw) {
			return null;
		}
		await this.materialize(raw);
		return this.mapWork(raw);
	}

	public async fetchSectionBySlug(slug: string, section: number): Promise<LiteraryWork | null> {
		// `sectionEnd` cierra el slice GROQ `content[$section...$sectionEnd]` (fin exclusivo): trae solo
		// la sección pedida. Se pasa como parámetro porque el typegen no infiere aritmética en el rango.
		const raw = await this.client.fetch(literaryWorkSectionBySlugQuery, { slug, section, sectionEnd: section + 1 });
		if (!raw) {
			return null;
		}
		// Cold-start: sin total persistido la respuesta parcial no basta (no trae todos los bodies para
		// derivarlo); un fetch full materializa+persiste una vez y proyectamos la sección desde ahí.
		if (raw.totalReadingTime === null) {
			return this.projectSectionFromFull(slug, section);
		}
		const projected = this.mapSectionProjection(raw, section, createReadingTime(raw.totalReadingTime));
		if (!projected) {
			throw new LiteraryWorkSectionNotFoundError(slug, section);
		}
		return projected;
	}

	private async projectSectionFromFull(slug: string, section: number): Promise<LiteraryWork | null> {
		const full = await this.fetchBySlug(slug);
		return full ? projectSingleSection(full, slug, section) : null;
	}

	// Write-on-read: persiste (setIfMissing, idempotente) los reading time faltantes cuando hay token.
	// Sin token cortocircuita antes de computar el plan (no re-parsea Markdown en el hot path de lectura).
	// Con un _key inválido o un fallo de escritura degrada dentro del try: no escribe y sirve lo derivado.
	private async materialize(raw: SanityLiteraryWork): Promise<void> {
		if (!this.canPersist || inFlightMaterializations.has(raw._id)) {
			return;
		}
		inFlightMaterializations.add(raw._id);
		try {
			const materialization = buildReadingTimeMaterialization(this.toMaterializationInput(raw));
			await applyReadingTimeMaterialization(this.client, raw._id, materialization);
		} catch (cause) {
			// Solo el mensaje: el error crudo del cliente Sanity puede transportar config con el write token.
			console.warn(
				`No se pudo materializar el reading time de la obra "${raw._id}"`,
				cause instanceof Error ? cause.message : String(cause),
			);
		} finally {
			inFlightMaterializations.delete(raw._id);
		}
	}

	// ───────────────────────── Traducción raw → dominio (ACL del adaptador) ─────────────────────────
	// La anti-corruption vive acá, no en una capa de mappers aparte: el adaptador es la única frontera
	// que conoce el shape de Sanity y entrega dominio listo. Reusa los sub-mappers transversales
	// (`mapAuthor`/`mapTags`/…, compartidos con otros dominios) como building blocks.

	private mapWork(raw: SanityLiteraryWork): LiteraryWork {
		const work = createLiteraryWork({
			...this.mapMetadata(raw),
			content: raw.content.map((section, index) => this.mapSection(section, index)),
		});
		// El total persistido es autoritativo (obras recitadas: la duración del medio ≠ la suma del texto):
		// la factory deriva un default de las secciones y el ACL lo sobrescribe con el valor materializado
		// cuando está presente — igual que la vía parcial, que recibe el total ya resuelto.
		return raw.totalReadingTime !== null
			? Object.freeze({ ...work, totalReadingTime: createReadingTime(raw.totalReadingTime) })
			: work;
	}

	// Proyección parcial (?section=N): agregado con una única sección en `position === section`, SIN
	// re-correr la invariante de posiciones contiguas de createLiteraryWork (el recorte lo hizo GROQ —
	// LITERARY_WORK_DESIGN.md §2/§7). El `totalReadingTime` ya resuelto lo pasa el read path.
	private mapSectionProjection(
		raw: SanityLiteraryWorkSectionProjection,
		section: number,
		totalReadingTime: ReadingTime,
	): LiteraryWork | null {
		const [rawSection] = raw.section;
		if (!rawSection) {
			return null;
		}
		return Object.freeze({
			...this.mapMetadata(raw),
			content: [this.mapSection(rawSection, section)],
			totalReadingTime,
			sectionCount: raw.sectionCount,
		});
	}

	private mapMetadata(raw: SanityLiteraryWorkMetadata) {
		// Invariantes de metadata en la frontera: la vía parcial no llama a createLiteraryWork, así que
		// sin esto un doc malformado se serviría en silencio por ?section=N. El full path las re-valida
		// en la factory (idempotente, mismo error).
		if (raw.title.trim() === '') {
			throw new Error(`LiteraryWork inválida: título vacío (slug "${raw.slug}")`);
		}
		if (raw.authors.length === 0) {
			throw new Error(`LiteraryWork inválida: sin autores (slug "${raw.slug}")`);
		}
		return {
			_id: raw._id,
			slug: createSlug(raw.slug),
			title: raw.title,
			authors: raw.authors.map(mapAuthor),
			coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
			mediaSources: mapMediaSources(raw.mediaSources),
			resources: mapResources(raw.resources),
			badLanguage: raw.badLanguage,
			tags: mapTags(raw.tags),
			originalPublication: raw.originalPublication,
			publishedAt: createIsoDateTime(raw.publishedAt),
		};
	}

	private mapSection(raw: SanityLiteraryWorkSection, index: number): LiteraryWorkSection {
		const body = createMarkdown(raw.body);
		return createLiteraryWorkSection({
			position: index,
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			epigraphs: raw.epigraphs.map((epigraph) => this.mapEpigraph(epigraph)),
			bodyHtml: markdownToSanitizedHtml(body),
			// Prefiere el readingTime persistido; deriva solo como fallback puro (sección sin materializar).
			readingTime: raw.readingTime !== null ? createReadingTime(raw.readingTime) : deriveSectionReadingTime(body),
		});
	}

	// `raw.text ?? ''` deja que createMarkdown lance ante un epígrafe sin texto: dato editorial inválido
	// que debe fallar en la frontera, no propagarse silenciado.
	private mapEpigraph(raw: SanityLiteraryWorkEpigraph): LiteraryWorkEpigraph {
		return createLiteraryWorkEpigraph({
			text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
			reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
		});
	}

	// Adaptador raw → input del modelo de materialización (#1986): el modelo computa sobre `body: Markdown`
	// y el raw trae `string`.
	private toMaterializationInput(raw: SanityLiteraryWork): ReadingTimeMaterializationInput {
		return {
			sections: raw.content.map((section) => ({
				_key: section._key,
				body: createMarkdown(section.body),
				readingTime: section.readingTime,
			})),
			totalReadingTime: raw.totalReadingTime,
		};
	}
}
