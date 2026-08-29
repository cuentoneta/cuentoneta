import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import {
	CENSUS_QUERY,
	INCOMING_REFERENCES_QUERY,
	LEGACY_FIELDS_CENSUS_QUERY,
	SURVIVING_REFERENCES_QUERY,
	WORKS_WITHOUT_COUNTERPART_QUERY,
} from './verification-queries';

const run = async (query: string, dataset: unknown[]) => (await evaluate(parse(query), { dataset })).get();

const reference = (id: string) => ({ _type: 'reference', _ref: id });

// El dataset reproduce el estado previo a la purga: los dos tipos a borrar en sus dos versiones, los
// tres campos legacy poblados, un cuento con obra derivada y otro sin ella, y una referencia colgada
// deliberada para que el chequeo posterior tenga algo que encontrar.
const datasetAntesDePurgar = [
	{ _id: 'story-1', _type: 'story', slug: { current: 'geometria' } },
	{ _id: 'story-2', _type: 'story', slug: { current: 'sin-contraparte' } },
	{ _id: 'drafts.story-3', _type: 'story', slug: { current: 'en-borrador' } },
	{ _id: 'lw-from-story-story-1', _type: 'literaryWork' },
	{ _id: 'storylist-1', _type: 'storylist', stories: [reference('story-1')] },
	{ _id: 'drafts.storylist-2', _type: 'storylist', stories: [] },
	{
		_id: 'landing-1974-24',
		_type: 'landingPage',
		cards: [reference('storylist-1')],
		latestReads: [reference('story-1'), reference('story-2')],
		collections: [reference('collection-1')],
		latestLiteraryWorks: [reference('lw-from-story-story-1')],
	},
	{ _id: 'rotatingContent', _type: 'rotatingContent', mostRead: [reference('story-1')] },
	// Referencia **débil**: es la única clase que el content lake no bloquea al borrar, así que un
	// referente débil pasaría la purga sin avisar y dejaría el hueco. Es justo lo que el gate previo
	// tiene que encontrar.
	{ _id: 'coleccion-suelta', _type: 'collection', destacada: { ...reference('story-1'), _weak: true } },
	{ _id: 'collection-1', _type: 'collection', literaryWorks: [reference('lw-from-story-story-1')] },
];

// El estado posterior a los dos primeros pasos: sin los campos legacy y sin las listas.
const sinReferentesFuertes = () => {
	const LEGACY_FIELDS = ['cards', 'latestReads', 'mostRead'];
	return datasetAntesDePurgar
		.filter((doc) => doc._type !== 'storylist')
		.map((doc) => Object.fromEntries(Object.entries(doc).filter(([key]) => !LEGACY_FIELDS.includes(key))));
};

describe('consultas de censo y verificación de la purga', () => {
	it('censa los documentos a purgar, separando publicados de borradores', async () => {
		expect(await run(CENSUS_QUERY, datasetAntesDePurgar)).toEqual({
			cuentosPublicados: 2,
			cuentosEnBorrador: 1,
			listasPublicadas: 1,
			listasEnBorrador: 1,
		});
	});

	it('da cero en el censo cuando ya no queda ninguno', async () => {
		const purgado = datasetAntesDePurgar.filter((doc) => !['story', 'storylist'].includes(doc._type));

		expect(await run(CENSUS_QUERY, purgado)).toEqual({
			cuentosPublicados: 0,
			cuentosEnBorrador: 0,
			listasPublicadas: 0,
			listasEnBorrador: 0,
		});
	});

	it('censa las referencias legacy que bloquean la purga', async () => {
		expect(await run(LEGACY_FIELDS_CENSUS_QUERY, datasetAntesDePurgar)).toEqual({
			cards: 1,
			latestReads: 2,
			mostRead: 1,
		});
	});

	// El `defined(...)` de cada filtro es lo que evita contar de más: sin él, un documento que no
	// declara el campo aporta un `[null]` al recorrido y suma uno.
	it('no cuenta de más los documentos que ya no declaran el campo', async () => {
		const sinCampos = [
			{ _id: 'landing-1975-01', _type: 'landingPage', collections: [] },
			{ _id: 'rotatingContent', _type: 'rotatingContent' },
		];

		expect(await run(LEGACY_FIELDS_CENSUS_QUERY, sinCampos)).toEqual({ cards: 0, latestReads: 0, mostRead: 0 });
	});

	it('descubre qué documentos referencian un cuento o una lista', async () => {
		const referenciados = (await run(INCOMING_REFERENCES_QUERY, datasetAntesDePurgar)) as {
			_id: string;
			referentes: { _id: string }[];
		}[];

		expect(referenciados.map(({ _id }) => _id).sort()).toEqual(['story-1', 'story-2', 'storylist-1']);
		expect(referenciados.find(({ _id }) => _id === 'storylist-1')?.referentes).toEqual([
			{ _id: 'landing-1974-24', _type: 'landingPage' },
		]);
	});

	// Es la consulta que decide si la purga puede correr, y por eso importa que siga encontrando lo que
	// el content lake **no** bloquea: una referencia débil deja borrar el destino sin protestar, así que
	// un referente débil pasaría la purga sin avisar y dejaría el hueco.
	it('sigue encontrando el referente débil, que es el que el content lake no bloquea', async () => {
		const referenciados = (await run(INCOMING_REFERENCES_QUERY, sinReferentesFuertes())) as {
			_id: string;
			referentes: { _id: string }[];
		}[];

		expect(referenciados).toHaveLength(1);
		expect(referenciados[0]?.referentes).toEqual([{ _id: 'coleccion-suelta', _type: 'collection' }]);
	});

	it('no encuentra ninguno una vez retirado también el referente débil', async () => {
		const sinNinguno = sinReferentesFuertes().filter((doc) => doc._id !== 'coleccion-suelta');

		expect(await run(INCOMING_REFERENCES_QUERY, sinNinguno)).toEqual([]);
	});

	it('lista el cuento publicado que no tiene obra derivada', async () => {
		expect(await run(WORKS_WITHOUT_COUNTERPART_QUERY, datasetAntesDePurgar)).toEqual([
			{ _id: 'story-2', slug: 'sin-contraparte' },
		]);
	});

	// El caso que la consulta existe para atrapar: una purga que se excedió y se llevó una obra.
	it('delata que la purga se llevó una obra que debía sobrevivir', async () => {
		const conColgada = datasetAntesDePurgar.filter((doc) => doc._id !== 'lw-from-story-story-1');

		expect(await run(SURVIVING_REFERENCES_QUERY, conColgada)).toEqual({
			collections: 0,
			latestWorks: 1,
			mostReadWorks: 0,
			obrasDeColeccion: 1,
		});
	});

	it('no encuentra ninguna colgada sobre un dataset íntegro', async () => {
		expect(await run(SURVIVING_REFERENCES_QUERY, datasetAntesDePurgar)).toEqual({
			collections: 0,
			latestWorks: 0,
			mostReadWorks: 0,
			obrasDeColeccion: 0,
		});
	});
});
