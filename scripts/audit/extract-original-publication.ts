/**
 * Deriva de la reseña de cada obra una **propuesta** de `originalPublication`, para revisión humana.
 *
 * La redacción ya escribió dónde y cuándo se publicó cada obra, en prosa: extraerlo cuesta menos y
 * arriesga menos que investigarlo afuera. Lo que sale de acá es una propuesta con la frase que la
 * respalda al lado — nunca un dato para persistir sin mirar.
 *
 * Read-only: no escribe nada en Sanity.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { client } from '../../src/api/_helpers/sanity-connector';

const dataset = process.env.AUDIT_DATASET;
const sanityClient = client.withConfig({ useCdn: false, ...(dataset ? { dataset } : {}) });

// Solo `literaryWork`: es el agregado cuyo campo se **renderiza** —en el hero de la página de
// lectura—, mientras que el de `story` viaja por las queries y ningún componente lo muestra.

interface Candidate {
	readonly slug: string;
	readonly title: string;
	readonly author: string;
	readonly review: string | null;
}

interface Proposal {
	readonly candidate: Candidate;
	/** El valor propuesto, con el formato del campo: `<Publicación> (<año>)`. */
	readonly value: string | null;
	/** La oración de la reseña de la que sale, para poder juzgarla sin abrir el CMS. */
	readonly evidence: string | null;
	/** Por qué conviene mirarla dos veces, cuando aplica. */
	readonly caveat: string | null;
}

const YEAR = /\b(1[5-9]\d{2}|20[0-2]\d)\b/;

// La redacción nombra la publicación de muchas formas, pero casi siempre precedida por el tipo de
// obra o por el verbo de publicar, y con el año en la misma oración. Se busca el nombre y el año por
// separado dentro de cada oración en vez de exigir que estén pegados: pretender una sola forma deja
// afuera la mayoría, y el resultado se revisa igual con la evidencia al lado.
const NAME_AFTER_KIND =
	/(?:revista|antolog[íi]a|colecci[óo]n|volumen|libro|peri[óo]dico|diario|obra|serie)\s+(?:de\s+(?:cuentos|relatos|poemas)\s+)?(?:titulad[oa]\s+)?["“]?([A-ZÁÉÍÓÚÑ][^"“”,.;(]{2,70}?)["”]?(?=[,.;(]|\s+(?:publicad|edita|el cual|la cual|una|que)|$)/;
const NAME_AFTER_VERB =
	/(?:publicad[oa]s?|apareci[óo]|edita[dr][oa]?)\s+(?:originalmente\s+|por primera vez\s+)*(?:en|como parte de|dentro de)\s+(?:la\s+|el\s+|los\s+|las\s+)?["“]?([A-ZÁÉÍÓÚÑ][^"“”,.;(]{2,70}?)["”]?(?=[,.;(]|\s+(?:publicad|edita|el cual|la cual|una|que)|$)/;

// Una recopilación póstuma o de obra reunida no es donde el texto apareció primero: el campo guarda
// la publicación original, así que estos casos se marcan para que alguien decida.
const COMPILATION =
	/(cuentos completos|obras completas|relatos reunidos|obra reunida|antología personal|cuentos reunidos)/i;

// La captura corta en la puntuación, pero la prosa suele continuar con la fecha o el verbo sin
// separador: sin recortarlos, el nombre propuesto se lleva media oración.
const TRAILING = /\s+(?:en|de|del)?\s*(?:su\s+edición.*|publicad.*|edita.*|\(?\d{4}\)?.*)$/i;

function nameIn(sentence: string): string | null {
	const match = NAME_AFTER_KIND.exec(sentence) ?? NAME_AFTER_VERB.exec(sentence);
	if (!match) return null;
	const name = match[1].replace(TRAILING, '').trim().replace(/\s+/g, ' ');
	return name.length > 2 ? name : null;
}

// La reseña a veces cuenta la trayectoria posterior de la obra —"luego fue incluida en…"—, que es
// justo lo contrario de lo que guarda el campo. Tomarla como publicación original es el error más
// caro de esta extracción, porque el resultado se ve igual de plausible.
const LATER =
	/\b(posteriormente|luego|m[áa]s tarde|despu[ée]s|reeditad|p[óo]stum|volvi[óo] a publicarse|la versi[óo]n aqu[íi])/i;

function caveatsFor(sentence: string, name: string): string | null {
	const caveats = [
		LATER.test(sentence) ? 'la oración habla de una edición POSTERIOR, no de la original' : null,
		COMPILATION.test(name) ? 'es una recopilación: puede no ser donde apareció primero' : null,
	].filter(Boolean);
	return caveats.join(' · ') || null;
}

function propose(candidate: Candidate): Proposal {
	const review = candidate.review?.replace(/\s+/g, ' ').trim() ?? '';
	if (!review) {
		return { candidate, value: null, evidence: null, caveat: null };
	}

	// Se recorre oración por oración: el año y el nombre tienen que convivir en la misma, o se estaría
	// pegando la fecha de una frase con el título de otra.
	for (const sentence of review.split(/(?<=[.!?])\s+/)) {
		const year = YEAR.exec(sentence)?.[0];
		const name = year ? nameIn(sentence) : null;
		if (year && name) {
			return { candidate, value: `${name} (${year})`, evidence: sentence, caveat: caveatsFor(sentence, name) };
		}
	}

	return { candidate, value: null, evidence: review, caveat: null };
}

// La reseña no vive en la obra literaria sino en el cuento del que se derivó, así que se la trae por
// slug — que es lo que ambos comparten. Se excluyen los borradores: una obra a medio editar es un
// estado normal del Studio, y la versión publicada es la que el sitio sirve.
const QUERY = `
	*[_type == "literaryWork" && !defined(originalPublication) && !(_id in path("drafts.**"))]{
		"slug": slug.current,
		title,
		"author": authors[0]->name,
		"review": pt::text(*[_type == "story" && slug.current == ^.slug.current][0].review)
	} | order(author asc, title asc)
`;

// `production` es privado y una credencial que no lo alcanza devuelve cero **sin error**, así que el
// informe saldría vacío como si no quedara nada por completar. `AUDIT_INPUT` permite pasarle el
// resultado de esa consulta ya obtenido por otra vía, en vez de fingir que se leyó el dataset.
const inputPath = process.env.AUDIT_INPUT;
const candidates: Candidate[] = inputPath
	? JSON.parse(readFileSync(inputPath, 'utf8'))
	: await sanityClient.fetch(QUERY);

if (candidates.length === 0) {
	throw new Error(
		'la consulta no devolvió ninguna obra: o no queda nada por completar, o la credencial no alcanza para leer el dataset',
	);
}

const proposals = candidates.map(propose);
const derived = proposals.filter((proposal) => proposal.value !== null);
const pending = proposals.filter((proposal) => proposal.value === null);
const flagged = derived.filter((proposal) => proposal.caveat !== null);

function row(proposal: Proposal): string {
	const { candidate } = proposal;
	return `| \`${candidate.slug}\` | ${candidate.author} | ${candidate.title} | ${proposal.value ?? ''} | ${proposal.caveat ?? ''} | ${(proposal.evidence ?? '').replace(/\|/g, '\\|')} |`;
}

const report = [
	'# Publicación original derivada de las reseñas',
	'',
	`${derived.length} de ${candidates.length} obras tienen el dato en su propia reseña. Lo de abajo es una **propuesta**: cada fila trae la oración que la respalda, para poder juzgarla sin abrir el CMS.`,
	'',
	`${flagged.length} llevan un reparo: la reseña habla de una edición posterior, o la publicación que nombra es una recopilación. Esas hay que mirarlas sí o sí.`,
	'',
	'## Propuestas',
	'',
	'| slug | Autor | Obra | Propuesta | Reparo | Evidencia |',
	'| --- | --- | --- | --- | --- | --- |',
	...derived.map(row),
	'',
	`## Sin propuesta (${pending.length}) — requieren investigación`,
	'',
	'| slug | Autor | Obra | Reseña |',
	'| --- | --- | --- | --- |',
	...pending.map(
		(proposal) =>
			`| \`${proposal.candidate.slug}\` | ${proposal.candidate.author} | ${proposal.candidate.title} | ${(proposal.evidence ?? '').replace(/\|/g, '\\|')} |`,
	),
].join('\n');

mkdirSync('workspace', { recursive: true });
writeFileSync('workspace/original-publication-proposals.md', report, 'utf8');

process.stdout.write(
	[
		`Obras sin publicación original: ${candidates.length}`,
		`  con propuesta derivada: ${derived.length}`,
		`  con reparo (revisar sí o sí): ${flagged.length}`,
		`  sin propuesta: ${pending.length}`,
		'Escrito en workspace/original-publication-proposals.md',
	].join('\n') + '\n',
);
