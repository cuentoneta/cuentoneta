/**
 * Actualiza el ranking de obras más leídas en el documento singleton `rotatingContent`, a partir de
 * las páginas más visitadas que reporta Clarity.
 *
 * Uso:
 *   pnpm ops most-read:update                 # corrida en seco: reporta el ranking que escribiría
 *   pnpm ops most-read:update --no-dry-run    # persiste
 */
import { environment } from '../../../src/api/_helpers/environment';
import type { ContentRepository } from '../../../src/api/modules/content/content.repository';
import { SanityContentRepository } from '../../../src/api/modules/content/content.repository.sanity';
import { updateMostReadLiteraryWorks } from '../../../src/api/modules/literary-work/literary-work.service';
import { RecordingContentRepository } from '../../recording-content-repository';
import type { OpsTask } from '../registry';

export async function runMostReadUpdate(
	apply: boolean,
	repository: ContentRepository = new SanityContentRepository(),
): Promise<string[]> {
	console.log(
		`Actualización de más leídas — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}, ` +
			`modo ${apply ? 'APLICAR' : 'seco'}`,
	);

	if (apply && !environment.sanity.token) {
		throw new Error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
	}
	if (!environment.clarity.token) {
		throw new Error('Falta el token de Clarity (CLARITY_TOKEN): no hay métrica de la que derivar el ranking.');
	}

	const recording = new RecordingContentRepository(repository, apply);
	await updateMostReadLiteraryWorks(recording);
	const slugs = [...recording.mostReadSlugs];

	console.log(`${apply ? 'Ranking escrito' : 'Ranking que se escribiría'} (${slugs.length} obras):`);
	console.log(slugs.map((slug, index) => `${index + 1}. ${slug}`).join('\n'));
	return slugs;
}

export const task: OpsTask = {
	run: async ({ apply }) => {
		await runMostReadUpdate(apply);
	},
};
