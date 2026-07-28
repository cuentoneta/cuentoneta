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

// Coalescing de materialización concurrente por documento. El write-on-read se dispara desde el endpoint
// de lectura público, así que una ráfaga anónima sobre la misma obra sin materializar podría lanzar N
// escrituras en la ventana previa a que `setIfMissing` cierre el campo. Este registro vive a nivel de
// módulo (el repository se instancia por request, así que un `Set` de instancia no coalescería entre
// requests): mientras una materialización está en vuelo, las demás sirven lo derivado sin re-escribir.
// La escritura ya es idempotente (`setIfMissing`); esto solo acota el consumo de cuota.
const inFlightMaterializations = new Set<string>();

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
	fetchSectionBySlug(slug: string, section: number): Promise<LiteraryWork | null>;
}

// Proyecta el agregado completo a una sola sección por `position` (respuesta parcial ?section=N servida
// desde un full-fetch). Lanza si el índice no existe. Compartido por el adaptador Sanity (cold-start) y
// el doble in-memory para que ambos proyecten idéntico — que no diverja el contrato (LSP).
export function projectSingleSection(full: LiteraryWork, slug: string, section: number): LiteraryWork {
	const found = full.content.find((candidate) => candidate.position === section);
	if (!found) {
		throw new LiteraryWorkSectionNotFoundError(slug, section);
	}
	return Object.freeze({ ...full, content: [found] });
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
			const materialization = buildReadingTimeMaterialization(toReadingTimeMaterializationInput(raw));
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
}
