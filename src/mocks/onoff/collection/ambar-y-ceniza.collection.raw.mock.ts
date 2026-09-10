// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import { dramaHistoricoRawTag, ensayoRawTag, tragediaRawTag } from '../../onoff-raw-tags.mock';
import { elOdioRawLiteraryWorkTeaser } from '../literary-work/el-odio.literary-work-teaser.raw.mock';
import { lasDosAntorchasRawLiteraryWorkTeaser } from '../literary-work/las-dos-antorchas.literary-work-teaser.raw.mock';
import { neronRawLiteraryWorkTeaser } from '../literary-work/neron.literary-work-teaser.raw.mock';
import ambarYCenizaCollectionMd from './ambar-y-ceniza.collection.md?raw';

export const ambarYCenizaRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-ambar-y-ceniza',
	slug: 'ambar-y-ceniza',
	title: 'Ámbar y ceniza',
	description: ambarYCenizaCollectionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [tragediaRawTag, dramaHistoricoRawTag, ensayoRawTag],
	mediaSources: [],
	literaryWorks: [lasDosAntorchasRawLiteraryWorkTeaser, neronRawLiteraryWorkTeaser, elOdioRawLiteraryWorkTeaser],
};
