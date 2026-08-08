import type { LandingPage } from '@sanity-types';
import { documentSystemFields, slugField } from '../document/sanity-document.factory';
import { coleccionCompletaContentCampaignDocument } from './coleccion-completa-onoff.content-campaign.document';
import { palacioNueveFronterasContentCampaignDocument } from './el-palacio-de-las-nueve-fronteras.content-campaign.document';

// La semana ISO del `SYSTEM_TIMESTAMP` del corpus, para que el elenco siga hablando de un solo momento.
// Va literal y no calculada: el content lake guarda un string, y derivarla al importar metería una
// dependencia de cálculo de fechas en una capa que solo transcribe lo que Sanity tiene guardado.
const week = '1974-24';

// No declara `cards` ni `latestReads`: referencian `storylist` y `story`, que el corpus no modela como
// documentos. Declararlos dejaría referencias colgadas y la guarda del generador abortaría —que es lo
// correcto—; la query los resuelve a `[]` y así queda afirmado en la fixture generada.
export const onoffLandingPageDocument: LandingPage = {
	...documentSystemFields(`onoff-landing-page-${week}`),
	_type: 'landingPage',
	config: week,
	slug: slugField(week),
	campaigns: [
		{
			_key: 'coleccion-completa-onoff',
			_type: 'reference',
			_ref: coleccionCompletaContentCampaignDocument._id,
		},
		{
			_key: 'el-palacio-de-las-nueve-fronteras',
			_type: 'reference',
			_ref: palacioNueveFronterasContentCampaignDocument._id,
		},
	],
};
