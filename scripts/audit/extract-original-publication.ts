/**
 * Deriva de la nota editorial de cada obra una **propuesta** de `originalPublication`, para revisión
 * humana, y releva de paso si esa nota menciona su inclusión en material educativo o cultural.
 *
 * La redacción ya escribió en prosa dónde y cuándo se publicó cada obra: extraerlo cuesta y arriesga
 * menos que investigarlo afuera, porque el dato bibliográfico es de los que un modelo produce
 * plausible y equivocado con la misma soltura. Lo que sale de acá es una propuesta con la frase que
 * la respalda al lado — nunca un dato para persistir sin mirar.
 *
 * Opera **solo sobre `literaryWork`**: es el agregado cuyo campo se renderiza, y su nota editorial es
 * fuente propia. El cuento del que cada obra se derivó no interviene.
 *
 * Read-only: no escribe nada en Sanity.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { client } from '../../src/api/_helpers/sanity-connector';

const dataset = process.env.AUDIT_DATASET;
const sanityClient = client.withConfig({ useCdn: false, ...(dataset ? { dataset } : {}) });

interface Candidate {
	readonly slug: string;
	readonly title: string;
	readonly author: string;
	/** Prosa editorial de la propia obra. Es Markdown, no Portable Text. */
	readonly editorialNote: string | null;
}

interface Proposal {
	readonly candidate: Candidate;
	/** El valor propuesto, con el formato del campo: `<Publicación> (<año>)`. */
	readonly value: string | null;
	/** La oración de la nota de la que sale, para poder juzgarla sin abrir el CMS. */
	readonly evidence: string | null;
	/** Por qué conviene mirarla dos veces, cuando aplica. */
	readonly caveat: string | null;
	/** La oración que menciona material educativo o cultural, si la nota la trae. */
	readonly educational: string | null;
}

const YEAR = /\b(1[5-9]\d{2}|20[0-2]\d)\b/;

// La redacción nombra la publicación de muchas formas, pero casi siempre precedida por el tipo de
// obra o por el verbo de publicar, y con el año en la misma oración. Se busca el nombre y el año por
// separado dentro de cada oración en vez de exigir que estén pegados: pretender una sola forma deja
// afuera la mayoría, y el resultado se revisa igual con la evidencia al lado.
const NAME_AFTER_KIND =
	/(?:revista|antolog[íi]a|colecci[óo]n|volumen|libro|peri[óo]dico|diario|obra|serie|novela|poemario)\s+(?:de\s+(?:cuentos|relatos|poemas)\s+)?(?:titulad[oa]\s+)?["“]?([A-ZÁÉÍÓÚÑ][^"“”,.;(]{2,70}?)["”]?(?=[,.;(]|\s+(?:publicad|edita|el cual|la cual|una|que)|$)/;
const NAME_AFTER_VERB =
	/(?:publicad[oa]s?|apareci[óo]|edita[dr][oa]?)\s+(?:originalmente\s+|por primera vez\s+)*(?:en|como parte de|dentro de)\s+(?:la\s+|el\s+|los\s+|las\s+)?["“]?([A-ZÁÉÍÓÚÑ][^"“”,.;(]{2,70}?)["”]?(?=[,.;(]|\s+(?:publicad|edita|el cual|la cual|una|que)|$)/;

// Una recopilación póstuma o de obra reunida no es donde el texto apareció primero: el campo guarda
// la publicación original, así que estos casos se marcan para que alguien decida.
const COMPILATION =
	/(cuentos completos|obras completas|relatos reunidos|obra reunida|antología personal|cuentos reunidos)/i;

// La nota a veces cuenta la trayectoria posterior de la obra —"luego fue incluida en…"—, que es justo
// lo contrario de lo que guarda el campo. Tomarla como publicación original es el error más caro de
// esta extracción, porque el resultado se ve igual de plausible.
const LATER =
	/\b(posteriormente|luego|m[áa]s tarde|despu[ée]s|reeditad|p[óo]stum|volvi[óo] a publicarse|la versi[óo]n aqu[íi])/i;

// La circulación en material educativo es **otro dato**: no entra en este campo, que guarda dónde
// apareció el texto por primera vez. Se releva aparte porque la nota ya lo menciona.
const EDUCATIONAL =
	/(ministerio|plan nacional de lectura|secretar[íi]a de (?:cultura|educaci[óo]n)|consejo (?:federal|provincial) de educaci[óo]n|libro de lectura|material (?:educativo|did[áa]ctico)|campa[ñn]a de lectura)/i;

// La captura corta en la puntuación, pero la prosa suele continuar con la fecha o el verbo sin
// separador: sin recortarlos, el nombre propuesto se lleva media oración.
const TRAILING = /\s+(?:en|de|del)?\s*(?:su\s+edición.*|publicad.*|edita.*|\(?\d{4}\)?.*)$/i;

// La nota es Markdown: el énfasis y los enlaces son ruido para el análisis y para leer la evidencia.
function plain(markdown: string): string {
	return markdown
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function nameIn(sentence: string): string | null {
	const match = NAME_AFTER_KIND.exec(sentence) ?? NAME_AFTER_VERB.exec(sentence);
	if (!match) return null;
	const name = match[1].replace(TRAILING, '').trim().replace(/\s+/g, ' ');
	return name.length > 2 ? name : null;
}

function caveatsFor(sentence: string, name: string): string | null {
	const caveats = [
		LATER.test(sentence) ? 'la oración habla de una edición POSTERIOR, no de la original' : null,
		COMPILATION.test(name) ? 'es una recopilación: puede no ser donde apareció primero' : null,
	].filter(Boolean);
	return caveats.join(' · ') || null;
}

function propose(candidate: Candidate): Proposal {
	const note = candidate.editorialNote?.trim();
	if (!note) {
		return { candidate, value: null, evidence: null, caveat: null, educational: null };
	}

	const sentences = plain(note).split(/(?<=[.!?])\s+/);
	const educational = sentences.find((sentence) => EDUCATIONAL.test(sentence)) ?? null;

	// Se recorre oración por oración: el año y el nombre tienen que convivir en la misma, o se estaría
	// pegando la fecha de una frase con el título de otra.
	for (const sentence of sentences) {
		const year = YEAR.exec(sentence)?.[0];
		const name = year ? nameIn(sentence) : null;
		if (year && name) {
			return {
				candidate,
				value: `${name} (${year})`,
				evidence: sentence,
				caveat: caveatsFor(sentence, name),
				educational,
			};
		}
	}

	return { candidate, value: null, evidence: plain(note), caveat: null, educational };
}

// Se excluyen los borradores: una obra a medio editar es un estado normal del Studio, y la versión
// publicada es la que el sitio sirve.
const QUERY = `
	*[_type == "literaryWork" && !defined(originalPublication) && !(_id in path("drafts.**"))]{
		"slug": slug.current,
		title,
		"author": authors[0]->name,
		editorialNote
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
const educational = proposals.filter((proposal) => proposal.educational !== null);

const cell = (text: string | null) => (text ?? '').replace(/\|/g, '\\|');

function proposalRow(proposal: Proposal): string {
	const { candidate } = proposal;
	return `| \`${candidate.slug}\` | ${candidate.author} | ${candidate.title} | ${cell(proposal.value)} | ${cell(proposal.caveat)} | ${cell(proposal.evidence)} |`;
}

const report = [
	'# Publicación original derivada de la nota editorial',
	'',
	`${derived.length} de ${candidates.length} obras literarias tienen el dato en su propia nota editorial. Lo de abajo es una **propuesta**: cada fila trae la oración que la respalda, para poder juzgarla sin abrir el CMS.`,
	'',
	`${flagged.length} llevan un reparo: la oración habla de una edición posterior, o la publicación que nombra es una recopilación. Esas hay que mirarlas sí o sí.`,
	'',
	'El formato del campo es `<Publicación> (<año>)`, con la editorial cuando se la conoce: `Sobre héroes y tumbas (Compañia fabril editora, 1961)`.',
	'',
	'## Propuestas',
	'',
	'| slug | Autor | Obra | Propuesta | Reparo | Evidencia |',
	'| --- | --- | --- | --- | --- | --- |',
	...derived.map(proposalRow),
	'',
	`## Sin propuesta (${pending.length}) — requieren investigación`,
	'',
	'La nota editorial va igual: aunque no alcance para derivar el valor, suele decir lo suficiente para completarlo a mano.',
	'',
	'| slug | Autor | Obra | Nota editorial |',
	'| --- | --- | --- | --- |',
	...pending.map(
		(proposal) =>
			`| \`${proposal.candidate.slug}\` | ${proposal.candidate.author} | ${proposal.candidate.title} | ${cell(proposal.evidence)} |`,
	),
	'',
	`## Circulación en material educativo o cultural (${educational.length})`,
	'',
	'Dato **distinto** del que guarda el campo: se releva porque la nota editorial ya lo menciona, no para persistirlo en `originalPublication`.',
	'',
	'| slug | Obra | Mención |',
	'| --- | --- | --- |',
	...educational.map(
		(proposal) => `| \`${proposal.candidate.slug}\` | ${proposal.candidate.title} | ${cell(proposal.educational)} |`,
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
		`  con mención a material educativo: ${educational.length}`,
		'Escrito en workspace/original-publication-proposals.md',
	].join('\n') + '\n',
);
