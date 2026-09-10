// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { RotatingContentQueryResult } from '@sanity-types';
import { landingLiteraryWorkFrom } from '../derive-raw';
import { elOdioRawLiteraryWorkTeaser } from '../literary-work/el-odio.literary-work-teaser.raw.mock';
import { lasEscalerasRawLiteraryWorkTeaser } from '../literary-work/las-escaleras.literary-work-teaser.raw.mock';

export const onoffRawRotatingContentMock: NonNullable<RotatingContentQueryResult> = {
	_id: 'rotatingContent',
	name: 'Lo más leído de Onoff',
	mostReadLiteraryWorks: [
		{ ...landingLiteraryWorkFrom(elOdioRawLiteraryWorkTeaser) },
		{ ...landingLiteraryWorkFrom(lasEscalerasRawLiteraryWorkTeaser) },
	],
};
