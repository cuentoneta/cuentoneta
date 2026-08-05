/**
 * Censo del Portable Text de las obras publicadas, previo a migrarlas a LiteraryWork.
 *
 * El conversor de `resources/portable-text-to-markdown/` cubre un subconjunto acotado —párrafo
 * `normal` con `em`, `strong` y enlaces— y **lanza** ante todo lo demás, a propósito. Este censo
 * responde, antes de tocar 613 documentos, si el corpus entra en ese subconjunto: correr la migración
 * para descubrirlo la detendría en el primer documento raro, tras haber escrito los anteriores.
 *
 * Read-only. No escribe en Sanity ni en el repo.
 *
 * Uso:
 *   pnpm exec tsx --env-file=.env scripts/audit/audit-story-portable-text.ts
 */
import { client } from '../../src/api/_helpers/sanity-connector';
import { environment } from '../../src/api/_helpers/environment';

// Los cuatro campos de la story que la migración convierte. `epigraphs` es un array, así que sus dos
// campos se relevan por separado con una proyección propia.
const PORTABLE_TEXT_FIELDS = ['body', 'review'] as const;

interface CensusBlock {
	_type: string;
	_key?: string;
	style?: string;
	listItem?: string;
	level?: number;
	markDefs?: { _type: string; _key?: string; href?: string }[];
	children?: { _type: string; marks?: string[]; text?: string }[];
}

interface CensusRow {
	slug: string;
	blocks: CensusBlock[] | null;
}

// El conversor solo sabe traducir esto. Todo lo que caiga fuera detendría la migración.
const SUPPORTED_STYLE = 'normal';
const SUPPORTED_MARKS = new Set(['em', 'strong']);
const SUPPORTED_MARK_DEF = 'link';
const SUPPORTED_LINK_SCHEMES = new Set(['http', 'https', 'mailto']);

interface Finding {
	construction: string;
	slug: string;
	blockKey: string;
}

function inspectBlock(block: CensusBlock, slug: string, findings: Finding[]): void {
	const blockKey = block._key ?? '(sin _key)';
	const report = (construction: string) => findings.push({ construction, slug, blockKey });

	if (block._type !== 'block') {
		report(`bloque _type="${block._type}"`);
		return;
	}
	if (block.style && block.style !== SUPPORTED_STYLE) {
		report(`style="${block.style}"`);
	}
	if (block.listItem) {
		report(`listItem="${block.listItem}"`);
	}
	if (block.level !== undefined && block.level > 1) {
		report(`lista anidada (level=${block.level})`);
	}
	for (const markDef of block.markDefs ?? []) {
		if (markDef._type !== SUPPORTED_MARK_DEF) {
			report(`markDef _type="${markDef._type}"`);
		}
		inspectHref(markDef.href, report);
	}
	inspectMarks(block, slug, findings);
	inspectText(block, report);
}

// El destino de un enlace no es prosa y no se escapa: el conversor detiene la corrida ante un esquema
// que el saneamiento del pipeline descartaría, o ante signos que rompen la forma delimitada de CommonMark.
function inspectHref(href: string | undefined, report: (construction: string) => void): void {
	if (href === undefined) return;

	const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(href)?.[1].toLowerCase();
	if (scheme !== undefined && !SUPPORTED_LINK_SCHEMES.has(scheme)) {
		report(`esquema de enlace "${scheme}"`);
	}
	if (/[<>]/.test(href)) {
		report('destino de enlace con "<" o ">"');
	}
}

/**
 * Los riesgos que la estructura no muestra viven en el **texto**: una construcción de bloque de
 * CommonMark escrita como prosa cambia de significado al releer el Markdown. El conversor las escapa,
 * pero el censo las reporta igual — saber que el corpus las trae es lo que justifica esos escapes.
 */
function inspectText(block: CensusBlock, report: (construction: string) => void): void {
	const riesgos: [RegExp, string][] = [
		[/^\s*#{1,6}(\s|$)/, 'numeral que abre línea'],
		[/^(?: {4,}|\t)/, 'sangría de bloque de código'],
		[/^\s*(~{3,}|`{3,})/, 'cerca de bloque de código'],
	];

	for (const child of block.children ?? []) {
		const lines = (child.text ?? '').split('\n');
		lines.forEach((line, index) => {
			for (const [patron, nombre] of riesgos) {
				if (patron.test(line)) report(nombre);
			}
			if (index > 0 && /^\s*(-+|=+)\s*$/.test(line) && (lines[index - 1] ?? '').trim() !== '') {
				report('tirada que quedaría como subrayado de encabezado');
			}
		});
		if (/`/.test(child.text ?? '')) report('backtick en el texto');
		if (/&(?:[a-zA-Z][a-zA-Z0-9]{1,31};|#\d{1,7};)/.test(child.text ?? '')) report('entidad HTML en el texto');
	}
}

// Una marca de span puede ser decorativa (`em`, `strong`) o apuntar a un `markDef` por su `_key`. Una
// que no sea ninguna de las dos cosas es una marca huérfana que el conversor no sabe resolver.
function inspectMarks(block: CensusBlock, slug: string, findings: Finding[]): void {
	const markDefKeys = new Set((block.markDefs ?? []).map((markDef) => markDef._key));
	for (const child of block.children ?? []) {
		for (const mark of child.marks ?? []) {
			if (!SUPPORTED_MARKS.has(mark) && !markDefKeys.has(mark)) {
				findings.push({ construction: `marca sin markDef ("${mark}")`, slug, blockKey: block._key ?? '(sin _key)' });
			}
		}
	}
}

function groupByConstruction(findings: readonly Finding[]): Map<string, Finding[]> {
	const grouped = new Map<string, Finding[]>();
	for (const finding of findings) {
		const bucket = grouped.get(finding.construction) ?? [];
		bucket.push(finding);
		grouped.set(finding.construction, bucket);
	}
	return grouped;
}

function reportFindings(field: string, findings: readonly Finding[]): void {
	if (findings.length === 0) {
		console.log(`  ${field.padEnd(22)} sin construcciones fuera del subconjunto`);
		return;
	}
	console.log(`  ${field}: ${findings.length} hallazgo(s)`);
	for (const [construction, rows] of [...groupByConstruction(findings)].sort(([, a], [, b]) => b.length - a.length)) {
		console.log(`     ${String(rows.length).padStart(4)}  ${construction}`);
		for (const row of rows.slice(0, 3)) {
			console.log(`           ${row.slug} (bloque ${row.blockKey})`);
		}
		if (rows.length > 3) {
			console.log(`           … y ${rows.length - 3} más`);
		}
	}
}

async function censusOfField(field: string): Promise<void> {
	const rows = await client.fetch<CensusRow[]>(
		`*[_type == "story" && !(_id in path("drafts.**")) && count(${field}) > 0]{
			"slug": slug.current, "blocks": ${field}
		}`,
	);
	const findings: Finding[] = [];
	for (const row of rows) {
		for (const block of row.blocks ?? []) {
			inspectBlock(block, row.slug, findings);
		}
	}
	reportFindings(`${field} (${rows.length} docs)`, findings);
}

async function censusOfEpigraphs(): Promise<void> {
	const rows = await client.fetch<{ slug: string; texts: CensusBlock[][]; references: CensusBlock[][] }[]>(
		`*[_type == "story" && !(_id in path("drafts.**")) && count(epigraphs) > 0]{
			"slug": slug.current,
			"texts": epigraphs[].text,
			"references": epigraphs[].reference
		}`,
	);
	for (const [label, key] of [
		['epigraphs[].text', 'texts'],
		['epigraphs[].reference', 'references'],
	] as const) {
		const findings: Finding[] = [];
		for (const row of rows) {
			for (const blocks of row[key] ?? []) {
				for (const block of blocks ?? []) {
					inspectBlock(block, row.slug, findings);
				}
			}
		}
		reportFindings(`${label} (${rows.length} docs)`, findings);
	}
}

async function reportCounts(): Promise<void> {
	const counts = await client.fetch<Record<string, number>>(`{
		"publicadas": count(*[_type == "story" && !(_id in path("drafts.**"))]),
		"conBody": count(*[_type == "story" && !(_id in path("drafts.**")) && count(body) > 0]),
		"conReview": count(*[_type == "story" && !(_id in path("drafts.**")) && count(review) > 0]),
		"conEpigrafes": count(*[_type == "story" && !(_id in path("drafts.**")) && count(epigraphs) > 0]),
		"sinPublishedAt": count(*[_type == "story" && !(_id in path("drafts.**")) && !defined(publishedAt)]),
		"obrasExistentes": count(*[_type == "literaryWork" && !(_id in path("drafts.**"))]),
		"sinTitle": count(*[_type == "story" && !(_id in path("drafts.**")) && !defined(title)]),
		"sinSlug": count(*[_type == "story" && !(_id in path("drafts.**")) && !defined(slug.current)]),
		"sinAuthor": count(*[_type == "story" && !(_id in path("drafts.**")) && !defined(author._ref)]),
		"sinBody": count(*[_type == "story" && !(_id in path("drafts.**")) && count(body) == 0])
	}`);
	console.log('\n=== Conteos ===');
	for (const [label, value] of Object.entries(counts)) {
		console.log(`  ${label.padEnd(20)} ${value}`);
	}
}

/**
 * Baseline de fidelidad: total de caracteres de texto plano por campo. Es el número contra el que se
 * contrasta el Markdown producido por el dry-run. Que la migración reporte 613 mutaciones dice que
 * alcanzó 613 documentos, no que no perdió contenido.
 */
async function reportFidelityBaseline(): Promise<void> {
	const totals = await client.fetch<Record<string, number>>(`{
		"body": math::sum(*[_type == "story" && !(_id in path("drafts.**")) && count(body) > 0]{"n": length(pt::text(body))}.n),
		"review": math::sum(*[_type == "story" && !(_id in path("drafts.**")) && count(review) > 0]{"n": length(pt::text(review))}.n)
	}`);
	console.log('\n=== Baseline de fidelidad (caracteres de texto plano) ===');
	for (const [field, total] of Object.entries(totals)) {
		console.log(`  ${field.padEnd(20)} ${total ?? 0}`);
	}
}

async function reportSlugIssues(): Promise<void> {
	const collisions = await client.fetch<string[]>(
		`*[_type == "story" && !(_id in path("drafts.**")) && slug.current in *[_type == "literaryWork"].slug.current].slug.current`,
	);
	// La validación del patrón se hace acá y no en GROQ: su operador `match` compara por tokens, no
	// por expresión regular, así que un `match "^[a-z0-9-]+$"` no valida nada — devuelve el corpus
	// entero como si no cumpliera.
	const slugs = await client.fetch<string[]>(`*[_type == "story" && !(_id in path("drafts.**"))].slug.current`);
	const malformed = slugs.filter((slug) => !/^[a-z0-9-]+$/.test(slug ?? ''));
	console.log('\n=== Slugs ===');
	console.log(
		`  colisiones con literaryWork  ${collisions.length}${collisions.length ? `: ${collisions.join(', ')}` : ''}`,
	);
	console.log(
		`  fuera del patrón esperado    ${malformed.length}${malformed.length ? `: ${malformed.join(', ')}` : ''}`,
	);
}

/** Sanity rechaza un documento con miembros de array sin `_key`; los documentos viejos pueden no tenerlo. */
async function reportMissingKeys(): Promise<void> {
	const fields = ['epigraphs', 'tags', 'mediaSources', 'resources'];
	console.log('\n=== Miembros de array sin _key ===');
	for (const field of fields) {
		const affected = await client.fetch<string[]>(
			`*[_type == "story" && !(_id in path("drafts.**")) && count(${field}[!defined(_key)]) > 0].slug.current`,
		);
		console.log(
			`  ${field.padEnd(20)} ${affected.length}${affected.length ? `: ${affected.slice(0, 5).join(', ')}` : ''}`,
		);
	}
}

async function run(): Promise<void> {
	console.log(
		`Censo de Portable Text — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}\n`,
	);
	console.log('=== Construcciones fuera del subconjunto que traduce el conversor ===');
	for (const field of PORTABLE_TEXT_FIELDS) {
		await censusOfField(field);
	}
	await censusOfEpigraphs();

	await reportCounts();
	await reportFidelityBaseline();
	await reportSlugIssues();
	await reportMissingKeys();
}

run().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
