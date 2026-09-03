// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { RotatingContentQueryResult } from '@sanity-types';
import { absurdoRawTag, alegoriaRawTag, dramaPsicologicoRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';

export const onoffRawRotatingContentMock: NonNullable<RotatingContentQueryResult> = {
	_id: 'rotatingContent',
	name: 'Lo más leído de Onoff',
	mostReadLiteraryWorks: [
		{
			_id: 'onoff-literary-work-el-odio',
			slug: 'el-odio',
			title: 'El odio',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
			totalReadingTime: 6,
			sectionCount: 1,
			tags: [novelaRawTag, dramaPsicologicoRawTag],
			mediaSources: [],
			authors: [
				{
					_id: 'author_1',
					slug: 'francois-onoff',
					name: 'François Onoff',
					image: { _type: 'image', asset: { _type: 'reference', _ref: 'image-francoisOnoffPortrait-1254x1254-png' } },
					nationality: {
						_id: 'nationality-francia',
						_type: 'nationality',
						_createdAt: '2021-12-28T00:00:00Z',
						_updatedAt: '2021-12-28T00:00:00Z',
						_rev: 'rev-francia',
						country: 'Francia',
						flag: { _type: 'image', asset: { _type: 'reference', _ref: 'image-franceFlag-30x20-png' } },
					},
					bornOn: '1948-01-01',
					bornOnYear: 1948,
					diedOn: '1994-12-31',
					diedOnYear: 1994,
				},
			],
		},
		{
			_id: 'onoff-literary-work-las-escaleras',
			slug: 'las-escaleras',
			title: 'Las escaleras',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
			totalReadingTime: 9,
			sectionCount: 1,
			tags: [novelaRawTag, absurdoRawTag, alegoriaRawTag],
			mediaSources: [{ _type: 'audioRecording', title: 'Lectura de "Las escaleras" por su autor' }],
			authors: [
				{
					_id: 'author_1',
					slug: 'francois-onoff',
					name: 'François Onoff',
					image: { _type: 'image', asset: { _type: 'reference', _ref: 'image-francoisOnoffPortrait-1254x1254-png' } },
					nationality: {
						_id: 'nationality-francia',
						_type: 'nationality',
						_createdAt: '2021-12-28T00:00:00Z',
						_updatedAt: '2021-12-28T00:00:00Z',
						_rev: 'rev-francia',
						country: 'Francia',
						flag: { _type: 'image', asset: { _type: 'reference', _ref: 'image-franceFlag-30x20-png' } },
					},
					bornOn: '1948-01-01',
					bornOnYear: 1948,
					diedOn: '1994-12-31',
					diedOnYear: 1994,
				},
			],
		},
	],
};
