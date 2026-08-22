import type { ReadingTimeBackfillCandidatesQueryResult } from '@sanity-types';
import { createMarkdown } from '@models/markdown.model';
import {
	applyReadingTimeMaterialization,
	buildReadingTimeMaterialization,
	type ReadingTimeMaterializationInput,
	type ReadingTimeMaterializationWriter,
} from '@models/reading-time-materialization.model';

export const READING_TIME_BACKFILL_PAGE_SIZE = 50;

// El shape lo declara el typegen a partir de la propia query: un rename de schema rompe el typecheck.
export type ReadingTimeBackfillCandidate = ReadingTimeBackfillCandidatesQueryResult[number];

export interface LiteraryWorkCandidatePageFetcher {
	fetchPage(cursor: string, pageSize: number): Promise<readonly ReadingTimeBackfillCandidate[]>;
}

export interface ReadingTimeBackfillReport {
	readonly inspected: number;
	readonly materialized: readonly { slug: string; sections: number; total: boolean }[];
	readonly skipped: readonly string[];
	readonly failed: readonly { slug: string; reason: string }[];
}

export function toMaterializationInput(candidate: ReadingTimeBackfillCandidate): ReadingTimeMaterializationInput {
	return {
		sections: candidate.content.map((section) => ({
			_key: section._key,
			body: createMarkdown(section.body),
			readingTime: section.readingTime,
		})),
		totalReadingTime: candidate.totalReadingTime,
	};
}

// Una página corta (o vacía) es el final del recorrido: no hay más documentos que pedir.
export function nextCursor(page: readonly ReadingTimeBackfillCandidate[], pageSize: number): string | null {
	return page.length === pageSize ? (page[page.length - 1]?._id ?? null) : null;
}

interface RunOptions {
	readonly fetcher: LiteraryWorkCandidatePageFetcher;
	readonly writer: ReadingTimeMaterializationWriter;
	readonly apply: boolean;
	readonly pageSize?: number;
}

export async function runReadingTimeBackfill(options: RunOptions): Promise<ReadingTimeBackfillReport> {
	const pageSize = options.pageSize ?? READING_TIME_BACKFILL_PAGE_SIZE;
	const materialized: { slug: string; sections: number; total: boolean }[] = [];
	const skipped: string[] = [];
	const failed: { slug: string; reason: string }[] = [];
	let inspected = 0;
	let cursor: string | null = '';

	while (cursor !== null) {
		const page = await options.fetcher.fetchPage(cursor, pageSize);
		for (const candidate of page) {
			inspected++;
			await processCandidate(candidate, options, { materialized, skipped, failed });
		}
		cursor = nextCursor(page, pageSize);
	}

	return { inspected, materialized, skipped, failed };
}

// Cada obra se procesa aislada: un documento con `_key` corrupto o una sección sin cuerpo se registra
// como fallida y el recorrido sigue. Un documento roto no puede abortar el backfill del catálogo.
async function processCandidate(
	candidate: ReadingTimeBackfillCandidate,
	options: RunOptions,
	buckets: {
		materialized: { slug: string; sections: number; total: boolean }[];
		skipped: string[];
		failed: { slug: string; reason: string }[];
	},
): Promise<void> {
	try {
		const materialization = buildReadingTimeMaterialization(toMaterializationInput(candidate));
		if (materialization.isEmpty) {
			buckets.skipped.push(candidate.slug);
			return;
		}
		if (options.apply) {
			await applyReadingTimeMaterialization(options.writer, candidate._id, materialization);
		}
		const paths = Object.keys(materialization.setIfMissing);
		buckets.materialized.push({
			slug: candidate.slug,
			sections: paths.filter((path) => path !== 'totalReadingTime').length,
			total: paths.includes('totalReadingTime'),
		});
	} catch (error) {
		buckets.failed.push({ slug: candidate.slug, reason: error instanceof Error ? error.message : String(error) });
	}
}

export function formatReadingTimeBackfillReport(
	report: ReadingTimeBackfillReport,
	options: { apply: boolean },
): string[] {
	const verb = options.apply ? 'Materializadas' : 'Se materializarían';
	const lines = [
		`Obras inspeccionadas: ${report.inspected}`,
		`${verb}: ${report.materialized.length}`,
		...report.materialized.map(
			(entry) =>
				`  · ${entry.slug} — ${entry.sections} ${entry.sections === 1 ? 'sección' : 'secciones'}${entry.total ? ' + total' : ''}`,
		),
		`Ya materializadas (sin cambios): ${report.skipped.length}`,
		`Fallidas: ${report.failed.length}`,
		...report.failed.map((entry) => `  · ${entry.slug} — ${entry.reason}`),
	];

	if (!options.apply && report.materialized.length > 0) {
		lines.push('', 'Corrida en seco. Para persistir: pnpm ops reading-time:backfill --no-dry-run');
	}
	return lines;
}
