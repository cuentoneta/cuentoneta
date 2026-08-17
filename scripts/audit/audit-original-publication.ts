/**
 * Auditoría one-off para el trabajo de completar `originalPublication`.
 *
 * Las obras que no declaran el campo suelen tener el dato **en prosa**, dentro de su reseña: la
 * redacción ya escribió dónde y cuándo se publicó cada una. Antes de mandar a investigar afuera
 * conviene extraer lo que el CMS ya sabe.
 *
 * Clasifica cada obra por la señal que su reseña contiene y vuelca el resultado a
 * `workspace/original-publication-audit.md`, que es el insumo del trabajo editorial.
 *
 * Read-only: no escribe nada en Sanity.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

import { client } from '../../src/api/_helpers/sanity-connector';

// El dataset lo fija el environment generado por `pnpm run config`, así que apuntar a otro exige
// decirlo acá: `AUDIT_DATASET=production pnpm exec tsx --env-file=.env scripts/audit/…`.
const dataset = process.env.AUDIT_DATASET;
const sanityClient = client.withConfig({ useCdn: false, ...(dataset ? { dataset } : {}) });

interface Candidate {
	readonly slug: string;
	readonly title: string;
	readonly author: string;
	readonly review: string | null;
	readonly resourceUrls: readonly string[];
}

// La reseña dice dónde se publicó cuando nombra el acto de publicar junto a un año. Buscar solo el
// año daría falsos positivos con la fecha de nacimiento del autor o la del hecho que narra.
const PUBLICATION_HINT =
	/(publicad|apareci|edita|se public|vio la luz|salió|integr|forma parte|colección|antología|revista|periódico|diario)/i;
const YEAR = /\b(1[5-9]\d{2}|20[0-2]\d)\b/;

function classify(candidate: Candidate): 'con-dato' | 'con-año' | 'sin-señal' | 'sin-reseña' {
	if (!candidate.review) return 'sin-reseña';
	const hasHint = PUBLICATION_HINT.test(candidate.review);
	const hasYear = YEAR.test(candidate.review);
	if (hasHint && hasYear) return 'con-dato';
	if (hasYear) return 'con-año';
	return 'sin-señal';
}

const candidates: Candidate[] = await sanityClient.fetch(`
	*[_type == "story" && !defined(originalPublication) && !(_id in path("drafts.**"))]{
		"slug": slug.current,
		title,
		"author": author->name,
		"review": pt::text(review),
		"resourceUrls": coalesce(resources[].url, [])
	} | order(author asc, title asc)
`);

const buckets = {
	'con-dato': [] as Candidate[],
	'con-año': [] as Candidate[],
	'sin-señal': [] as Candidate[],
	'sin-reseña': [] as Candidate[],
};
for (const candidate of candidates) {
	buckets[classify(candidate)].push(candidate);
}

const TITLES: Record<keyof typeof buckets, string> = {
	'con-dato': 'La reseña nombra la publicación y el año — se extrae del CMS, sin investigar',
	'con-año': 'La reseña trae un año pero no dice dónde — verificar qué año es',
	'sin-señal': 'La reseña no aporta procedencia — hay que investigar',
	'sin-reseña': 'Sin reseña — hay que investigar',
};

function section(key: keyof typeof buckets): string {
	const rows = buckets[key].map((candidate) => {
		const review = candidate.review?.replace(/\s+/g, ' ').trim() ?? '';
		const sources = candidate.resourceUrls.filter(Boolean).join(' · ');
		return [
			`### ${candidate.author} — ${candidate.title}`,
			'',
			`- **slug:** \`${candidate.slug}\``,
			sources ? `- **fuente del texto:** ${sources}` : '',
			review ? `- **reseña:** ${review}` : '',
			'- **publicación original:** ',
			'- **material educativo/cultural:** ',
		]
			.filter(Boolean)
			.join('\n');
	});

	return [`## ${TITLES[key]} (${buckets[key].length})`, '', ...rows].join('\n\n');
}

const report = [
	'# Insumo para completar la publicación original',
	'',
	`${candidates.length} obras publicadas sin \`originalPublication\`, agrupadas por lo que su reseña ya aporta.`,
	'',
	'El formato del campo es `<Libro o publicación periódica> (<año>)` — por ejemplo `Cuentos de locura de amor y de muerte (1917)` o `The San Francisco Examiner (1891)`.',
	'',
	'La columna de material educativo/cultural es **otro dato**: no entra en este campo, que guarda solo la publicación original. Se releva aparte.',
	'',
	(Object.keys(buckets) as (keyof typeof buckets)[]).map(section).join('\n\n---\n\n'),
].join('\n');

mkdirSync('workspace', { recursive: true });
writeFileSync('workspace/original-publication-audit.md', report, 'utf8');

process.stdout.write(
	[
		`Obras sin publicación original: ${candidates.length}`,
		...(Object.keys(buckets) as (keyof typeof buckets)[]).map((key) => `  ${key}: ${buckets[key].length}`),
		'Escrito en workspace/original-publication-audit.md',
	].join('\n') + '\n',
);
