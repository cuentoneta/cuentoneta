/**
 * Pre-genera los documentos `landingPage` de las próximas semanas copiando las referencias de la última
 * configuración no futura. Idempotente: solo crea las semanas que faltan.
 *
 * Uso:
 *   pnpm ops landing-pages:add-next-weeks                    # corrida en seco, 4 semanas
 *   pnpm ops landing-pages:add-next-weeks --weeks=6          # corrida en seco, 6 semanas
 *   pnpm ops landing-pages:add-next-weeks --no-dry-run       # persiste
 */
import { environment } from '@api/_helpers/environment';
import type { ContentRepository } from '@api/modules/content/content.repository';
import { SanityContentRepository } from '@api/modules/content/content.repository.sanity';
import { addNextWeeksLandingPageContent } from '@api/modules/content/content.service';
import { RecordingContentRepository } from '../../recording-content-repository';
import type { OpsTask } from '../registry';

const DEFAULT_WEEKS = 4;
const MAX_WEEKS = 26;
const WEEKS_FLAG = '--weeks=';

export function parseWeeks(argv: readonly string[]): number {
	const unknown = argv.find((arg) => !arg.startsWith(WEEKS_FLAG));
	if (unknown !== undefined) {
		throw new Error(`Argumento desconocido: ${unknown}`);
	}
	const raw = argv[0]?.slice(WEEKS_FLAG.length);
	if (raw === undefined) {
		return DEFAULT_WEEKS;
	}
	if (!/^[1-9]\d{0,2}$/.test(raw) || Number(raw) > MAX_WEEKS) {
		throw new Error(`--weeks debe ser un entero entre 1 y ${MAX_WEEKS}, recibió "${raw}".`);
	}
	return Number(raw);
}

export async function runAddNextWeeksLandingPages(
	apply: boolean,
	weeks: number,
	repository: ContentRepository = new SanityContentRepository(),
): Promise<string[]> {
	console.log(
		`Landing pages de las próximas ${weeks} semanas — proyecto ${environment.sanity.projectId}, ` +
			`dataset ${environment.sanity.dataset}, modo ${apply ? 'APLICAR' : 'seco'}`,
	);

	if (!environment.sanity.projectId) {
		throw new Error('Falta el id del proyecto de Sanity (SANITY_STUDIO_PROJECT_ID).');
	}
	if (apply && !environment.sanity.token) {
		throw new Error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
	}

	const recording = new RecordingContentRepository(repository, apply);
	await addNextWeeksLandingPageContent(weeks, recording);
	const slugs = recording.landingPages.map(({ config }) => config);

	console.log(
		slugs.length === 0
			? 'Ya existen las landing pages de todas las semanas pedidas.'
			: `${apply ? 'Creadas' : 'Se crearían'}: ${slugs.join(', ')}`,
	);
	return slugs;
}

export const task: OpsTask = {
	run: async ({ apply, argv }) => {
		await runAddNextWeeksLandingPages(apply, parseWeeks(argv));
	},
};
