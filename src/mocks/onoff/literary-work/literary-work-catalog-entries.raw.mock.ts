// Este archivo lo escribe `pnpm ops corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkCatalogEntriesQueryResult } from '@sanity-types';
import { literaryWorkCatalogEntryFrom } from '../derive-raw';
import { elOdioRawLiteraryWork } from './el-odio.literary-work.raw.mock';
import { palacioNueveFronterasRawLiteraryWork } from './el-palacio-de-las-nueve-fronteras.literary-work.raw.mock';
import { elTratadoDeLosPlaceresRawLiteraryWork } from './el-tratado-de-los-placeres.literary-work.raw.mock';
import { geometriaRawLiteraryWork } from './geometria.literary-work.raw.mock';
import { lasDosAntorchasRawLiteraryWork } from './las-dos-antorchas.literary-work.raw.mock';
import { lasEscalerasRawLiteraryWork } from './las-escaleras.literary-work.raw.mock';
import { losPeldanosRawLiteraryWork } from './los-peldanos.literary-work.raw.mock';
import { neronRawLiteraryWork } from './neron.literary-work.raw.mock';

export const onoffRawLiteraryWorkCatalogEntriesMock: LiteraryWorkCatalogEntriesQueryResult = [
	{ ...literaryWorkCatalogEntryFrom(elOdioRawLiteraryWork) },
	{ ...literaryWorkCatalogEntryFrom(palacioNueveFronterasRawLiteraryWork) },
	{ ...literaryWorkCatalogEntryFrom(elTratadoDeLosPlaceresRawLiteraryWork) },
	{ ...literaryWorkCatalogEntryFrom(geometriaRawLiteraryWork) },
	{ ...literaryWorkCatalogEntryFrom(lasDosAntorchasRawLiteraryWork) },
	{ ...literaryWorkCatalogEntryFrom(lasEscalerasRawLiteraryWork) },
	{ ...literaryWorkCatalogEntryFrom(losPeldanosRawLiteraryWork) },
	{ ...literaryWorkCatalogEntryFrom(neronRawLiteraryWork) },
];
