import type { SanityClient } from '@sanity/client';
import type { LiteraryWork } from '@models/literary-work.model';
import { createReadingTime } from '@models/reading-time.model';
import {
	applyReadingTimeMaterialization,
	buildReadingTimeMaterialization,
} from '@models/reading-time-materialization.model';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { environment } from '../../_helpers/environment';
import { literaryWorkBySlugQuery, literaryWorkSectionBySlugQuery } from '../../_queries/literary-work.query';
import {
	mapLiteraryWork,
	mapLiteraryWorkSectionProjection,
	toReadingTimeMaterializationInput,
	type SanityLiteraryWork,
} from '../../_utils/literary-work.functions';
import { LiteraryWorkSectionNotFoundError } from './literary-work.errors';

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
	fetchSectionBySlug(slug: string, section: number): Promise<LiteraryWork | null>;
}

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
		return mapLiteraryWork(raw);
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
		const projected = mapLiteraryWorkSectionProjection(raw, section, createReadingTime(raw.totalReadingTime));
		if (!projected) {
			throw new LiteraryWorkSectionNotFoundError(slug, section);
		}
		return projected;
	}

	private async projectSectionFromFull(slug: string, section: number): Promise<LiteraryWork | null> {
		const full = await this.fetchBySlug(slug);
		if (!full) {
			return null;
		}
		const found = full.content.find((candidate) => candidate.position === section);
		if (!found) {
			throw new LiteraryWorkSectionNotFoundError(slug, section);
		}
		return Object.freeze({ ...full, content: [found] });
	}

	// Write-on-read: persiste (setIfMissing, idempotente) los reading time faltantes cuando hay token.
	// Sin token cortocircuita antes de computar el plan (no re-parsea Markdown en el hot path de lectura).
	// Con un _key inválido o un fallo de escritura degrada dentro del try: no escribe y sirve lo derivado.
	private async materialize(raw: SanityLiteraryWork): Promise<void> {
		if (!this.canPersist) {
			return;
		}
		try {
			const materialization = buildReadingTimeMaterialization(toReadingTimeMaterializationInput(raw));
			await applyReadingTimeMaterialization(this.client, raw._id, materialization);
		} catch (cause) {
			// Solo el mensaje: el error crudo del cliente Sanity puede transportar config con el write token.
			console.warn(
				`No se pudo materializar el reading time de la obra "${raw._id}"`,
				cause instanceof Error ? cause.message : String(cause),
			);
		}
	}
}
