/**
 * Auditoría read-only: autores y cuentos con ficha incompleta que debilita
 * los datos estructurados (Person / Article). Emite un reporte Markdown
 * (y CSV) en `tools/structured-data-audit/` (gitignored).
 *
 * Uso:
 *   pnpm exec tsx --env-file=.env scripts/audit/audit-structured-data-completeness.ts
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { client } from '../../src/api/_helpers/sanity-connector';
import {
	AUTHOR_CORE_GAPS,
	BIOGRAPHY_MIN_CHARS,
	evaluateAuthor,
	evaluateStory,
	groupByGap,
	STORY_GAPS,
	type AuthorAuditInput,
	type AuthorAuditResult,
	type AuthorGap,
	type StoryAuditInput,
	type StoryAuditResult,
	type StoryGap,
} from './structured-data-completeness';

interface AuthorRow {
	name: string;
	slug: string | null;
	hasImage: boolean;
	resourceUrls: Array<string | null> | null;
	hasNationality: boolean;
	biographyText: string | null;
	bornOn: string | null;
	diedOn: string | null;
}

interface StoryRow {
	title: string | null;
	slug: string | null;
	hasAuthor: boolean;
	hasPublishedAt: boolean;
	originalPublication: string | null;
	reviewText: string | null;
}

const AUTHOR_GAP_LABEL: Record<AuthorGap, string> = {
	slug: 'slug (rompe URL del Person)',
	image: 'image → Person.image',
	sameAs: 'resources[].url → Person.sameAs',
	nationality: 'nationality',
	biography: `biography vacía o < ${BIOGRAPHY_MIN_CHARS} chars`,
	bornOn: 'bornOn → birthDate',
	diedOn: 'diedOn → deathDate (opcional si el autor vive)',
};

const STORY_GAP_LABEL: Record<StoryGap, string> = {
	title: 'title',
	slug: 'slug',
	author: 'author (rompe Person anidado)',
	publishedAt: 'publishedAt editorial (usa fallback _createdAt)',
	originalPublication: 'originalPublication',
	review: 'review / summary',
};

const fetchAuthors = (): Promise<AuthorRow[]> =>
	client.fetch(`*[_type == "author" && !(_id in path("drafts.**"))] | order(name asc) {
		name,
		"slug": slug.current,
		"hasImage": defined(image.asset),
		"resourceUrls": resources[].url,
		"hasNationality": defined(nationality),
		"biographyText": pt::text(biography),
		bornOn,
		diedOn
	}`);

const fetchStories = (): Promise<StoryRow[]> =>
	client.fetch(`*[_type == "story" && !(_id in path("drafts.**"))] | order(title asc) {
		title,
		"slug": slug.current,
		"hasAuthor": defined(author),
		"hasPublishedAt": defined(publishedAt),
		originalPublication,
		"reviewText": pt::text(review)
	}`);

const label = (item: { slug: string | null; name?: string; title?: string | null }): string => {
	const id = item.slug?.trim() || '(sin-slug)';
	const name = item.name ?? item.title ?? '';
	return name ? `${id} — ${name}` : id;
};

const renderAuthorSection = (results: AuthorAuditResult[]): string => {
	const incomplete = results.filter((r) => r.coreGaps.length > 0);
	const byGap = groupByGap(
		incomplete.map((r) => ({ gaps: r.coreGaps })),
		AUTHOR_CORE_GAPS,
	);
	const lines: string[] = [
		`## Autores`,
		``,
		`- Total publicados: **${results.length}**`,
		`- Con al menos un gap core: **${incomplete.length}**`,
		`- Completos (core): **${results.length - incomplete.length}**`,
		``,
		`### Conteo por campo faltante (core)`,
		``,
	];
	for (const g of AUTHOR_CORE_GAPS) {
		lines.push(`- \`${g}\` (${AUTHOR_GAP_LABEL[g]}): **${byGap[g]}**`);
	}
	lines.push(``, `### Por campo (detalle)`, ``);
	for (const g of AUTHOR_CORE_GAPS) {
		const hit = incomplete.filter((r) => r.coreGaps.includes(g));
		if (hit.length === 0) continue;
		lines.push(`#### ${g} (${hit.length})`, ``);
		for (const r of hit) lines.push(`- ${label(r)}`);
		lines.push(``);
	}
	lines.push(`### Ranking por incompleteness (core)`, ``);
	lines.push(`| slug | name | gaps core | incompleteness |`);
	lines.push(`| --- | --- | --- | ---: |`);
	const ranked = [...incomplete].sort(
		(a, b) => b.incompleteness - a.incompleteness || (a.slug ?? '').localeCompare(b.slug ?? ''),
	);
	for (const r of ranked) {
		lines.push(
			`| ${r.slug ?? '—'} | ${r.name.replace(/\|/g, '\\|')} | ${r.coreGaps.join(', ')} | ${(r.incompleteness * 100).toFixed(0)}% |`,
		);
	}
	const withBornWithoutDied = results.filter((r) => !r.gaps.includes('bornOn') && r.gaps.includes('diedOn')).length;
	lines.push(``, `### Nota: diedOn`, ``);
	lines.push(
		`\`diedOn\` es enriquecimiento opcional (no entra en el score core). Autores con \`bornOn\` y sin \`diedOn\`: **${withBornWithoutDied}** (puede ser intencional si el autor vive).`,
	);
	lines.push(``);
	return lines.join('\n');
};

const renderStorySection = (results: StoryAuditResult[]): string => {
	const incomplete = results.filter((r) => r.gaps.length > 0);
	const fallback = results.filter((r) => r.usesCreatedAtFallback);
	const byGap = groupByGap(incomplete, STORY_GAPS);
	const lines: string[] = [
		`## Cuentos`,
		``,
		`- Total publicados: **${results.length}**`,
		`- Con al menos un gap: **${incomplete.length}**`,
		`- Completos: **${results.length - incomplete.length}**`,
		`- Usan fallback \`_createdAt\` (sin \`publishedAt\` editorial): **${fallback.length}**`,
		``,
		`### Conteo por campo faltante`,
		``,
	];
	for (const g of STORY_GAPS) {
		lines.push(`- \`${g}\` (${STORY_GAP_LABEL[g]}): **${byGap[g]}**`);
	}
	lines.push(``, `### publishedAt → fallback _createdAt (${fallback.length})`, ``);
	for (const r of fallback) lines.push(`- ${label({ slug: r.slug, title: r.title })}`);
	lines.push(``, `### Por campo (detalle)`, ``);
	for (const g of STORY_GAPS) {
		if (g === 'publishedAt') continue;
		const hit = incomplete.filter((r) => r.gaps.includes(g));
		if (hit.length === 0) continue;
		lines.push(`#### ${g} (${hit.length})`, ``);
		for (const r of hit) lines.push(`- ${label({ slug: r.slug, title: r.title })}`);
		lines.push(``);
	}
	lines.push(`### Ranking por incompleteness`, ``);
	lines.push(`| slug | title | gaps | incompleteness |`);
	lines.push(`| --- | --- | --- | ---: |`);
	const ranked = [...incomplete].sort(
		(a, b) => b.incompleteness - a.incompleteness || (a.slug ?? '').localeCompare(b.slug ?? ''),
	);
	for (const r of ranked) {
		const title = (r.title ?? '').replace(/\|/g, '\\|');
		lines.push(`| ${r.slug ?? '—'} | ${title} | ${r.gaps.join(', ')} | ${(r.incompleteness * 100).toFixed(0)}% |`);
	}
	return lines.join('\n');
};

const toCsv = (headers: string[], rows: string[][]): string => {
	const esc = (c: string) => {
		if (/[",\n]/.test(c)) return `"${c.replace(/"/g, '""')}"`;
		return c;
	};
	return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n') + '\n';
};

const mapAuthors = (rows: AuthorRow[]): AuthorAuditResult[] =>
	rows.map((row) =>
		evaluateAuthor({
			name: row.name,
			slug: row.slug,
			hasImage: row.hasImage,
			resourceUrls: row.resourceUrls,
			hasNationality: row.hasNationality,
			biographyText: row.biographyText,
			bornOn: row.bornOn,
			diedOn: row.diedOn,
		} satisfies AuthorAuditInput),
	);

const mapStories = (rows: StoryRow[]): StoryAuditResult[] =>
	rows.map((row) =>
		evaluateStory({
			title: row.title,
			slug: row.slug,
			hasAuthor: row.hasAuthor,
			hasPublishedAt: row.hasPublishedAt,
			originalPublication: row.originalPublication,
			reviewText: row.reviewText,
		} satisfies StoryAuditInput),
	);

const buildReport = (authors: AuthorAuditResult[], stories: StoryAuditResult[]): string => {
	const generatedAt = new Date().toISOString();
	const dataset = process.env['SANITY_STUDIO_DATASET'] ?? '(desconocido)';
	return [
		`# Auditoría de completitud de fichas (structured data)`,
		``,
		`- Generado: \`${generatedAt}\``,
		`- Dataset: \`${dataset}\``,
		`- Criterio biografía corta: < ${BIOGRAPHY_MIN_CHARS} caracteres de texto plano`,
		`- Score de autor: gaps **core** / ${AUTHOR_CORE_GAPS.length} (sin \`diedOn\`)`,
		`- Score de cuento: gaps / ${STORY_GAPS.length}`,
		``,
		renderAuthorSection(authors),
		``,
		renderStorySection(stories),
		``,
	].join('\n');
};

const writeOutputs = async (
	outDir: string,
	report: string,
	authors: AuthorAuditResult[],
	stories: StoryAuditResult[],
): Promise<string> => {
	await mkdir(outDir, { recursive: true });
	const reportPath = join(outDir, 'report.md');
	await writeFile(reportPath, report, 'utf8');
	const authorsCsv = toCsv(
		['slug', 'name', 'core_gaps', 'all_gaps', 'incompleteness'],
		authors
			.filter((a) => a.coreGaps.length > 0)
			.map((a) => [a.slug ?? '', a.name, a.coreGaps.join('|'), a.gaps.join('|'), a.incompleteness.toFixed(3)]),
	);
	await writeFile(join(outDir, 'authors-incomplete.csv'), authorsCsv, 'utf8');
	const storiesCsv = toCsv(
		['slug', 'title', 'gaps', 'uses_created_at_fallback', 'incompleteness'],
		stories
			.filter((s) => s.gaps.length > 0)
			.map((s) => [
				s.slug ?? '',
				s.title ?? '',
				s.gaps.join('|'),
				s.usesCreatedAtFallback ? 'true' : 'false',
				s.incompleteness.toFixed(3),
			]),
	);
	await writeFile(join(outDir, 'stories-incomplete.csv'), storiesCsv, 'utf8');
	return reportPath;
};

const logSummary = (authors: AuthorAuditResult[], stories: StoryAuditResult[], reportPath: string, outDir: string) => {
	const authorIncomplete = authors.filter((a) => a.coreGaps.length > 0).length;
	const storyIncomplete = stories.filter((s) => s.gaps.length > 0).length;
	const storyFallback = stories.filter((s) => s.usesCreatedAtFallback).length;
	console.log(`\nAutores: ${authors.length} (${authorIncomplete} incompletos core)`);
	console.log(
		`Cuentos: ${stories.length} (${storyIncomplete} incompletos; ${storyFallback} sin publishedAt editorial)`,
	);
	console.log(`\n✓ Reporte: ${reportPath}`);
	console.log(`  CSV:     ${join(outDir, 'authors-incomplete.csv')}`);
	console.log(`  CSV:     ${join(outDir, 'stories-incomplete.csv')}`);
};

const run = async () => {
	console.log('Consultando autores y cuentos en Sanity…');
	const [authorRows, storyRows] = await Promise.all([fetchAuthors(), fetchStories()]);
	const authors = mapAuthors(authorRows);
	const stories = mapStories(storyRows);
	const report = buildReport(authors, stories);
	const outDir = join(process.cwd(), 'tools', 'structured-data-audit');
	const reportPath = await writeOutputs(outDir, report, authors, stories);
	logSummary(authors, stories, reportPath, outDir);
};

run().catch((err) => {
	console.error('\nLa auditoría falló:', err);
	process.exit(1);
});
