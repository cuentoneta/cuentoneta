import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import migration, { AUDIO_NARRATION } from './index';

const migrateDocument = (doc: Record<string, unknown>) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never) as { path: string[]; op: { type: string; items?: unknown[] } }[];
};

const youTubeVideo = { _key: 'yt1', _type: 'youTubeVideo', videoId: 'ymKePA9X7eQ' };

const aLaDeriva = (overrides: Record<string, unknown> = {}) => ({
	_id: 'lw-a-la-deriva',
	_type: 'literaryWork',
	slug: { current: 'a-la-deriva' },
	mediaSources: [youTubeVideo],
	...overrides,
});

describe('migración de la narración en audio de A la deriva', () => {
	// El filtro se ejecuta con el mismo motor que GROQ y no se compara como texto: una aserción textual
	// pasa igual con un filtro roto mientras el literal coincida.
	describe('el filtro decide qué entra', () => {
		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('admite la obra y también su borrador', async () => {
			const docs = [aLaDeriva(), aLaDeriva({ _id: 'drafts.lw-a-la-deriva' })];

			expect(await matching(...docs)).toEqual(['lw-a-la-deriva', 'drafts.lw-a-la-deriva']);
		});

		it('deja fuera cualquier otra obra', async () => {
			expect(await matching({ _id: 'otra', _type: 'literaryWork', slug: { current: 'el-fin' } })).toEqual([]);
		});
	});

	it('agrega la narración al final de los recursos existentes', () => {
		const patches = migrateDocument(aLaDeriva());

		expect(patches.map(({ path, op }) => [path[0], op.type])).toEqual([
			['mediaSources', 'setIfMissing'],
			['mediaSources', 'insert'],
		]);
		expect(patches[1].op.items).toEqual([AUDIO_NARRATION]);
	});

	it('crea el array cuando la obra no declara ningún recurso', () => {
		const patches = migrateDocument(aLaDeriva({ mediaSources: undefined }));

		expect(patches).toHaveLength(2);
	});

	// La identidad del recurso es su URL, no su clave: el dataset curado a mano lleva el mismo episodio
	// bajo la misma clave, pero uno cargado desde el Studio tendría clave propia y sigue siendo el mismo
	// contenido — duplicarlo mostraría dos veces la misma narración en el selector.
	it('no duplica el episodio aunque esté bajo otra clave', () => {
		const alreadyCurated = aLaDeriva({
			mediaSources: [
				youTubeVideo,
				{ _key: 'clave-del-studio', _type: 'spotifyPodcastEpisode', url: AUDIO_NARRATION.url },
			],
		});

		expect(migrateDocument(alreadyCurated)).toEqual([]);
	});

	// El guard revalida sobre el documento porque el filtro es una optimización del runner, no la garantía.
	it('ignora una obra que no es la del recurso', () => {
		expect(migrateDocument({ _id: 'otra', slug: { current: 'el-fin' }, mediaSources: [] })).toEqual([]);
	});
});
