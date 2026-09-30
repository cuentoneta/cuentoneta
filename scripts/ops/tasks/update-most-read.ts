/**
 * Actualiza el ranking de obras más leídas en el documento singleton `rotatingContent`, a partir de
 * las páginas más visitadas que reporta Clarity. Escribe siempre, con o sin `--no-dry-run`.
 *
 * Uso:
 *   pnpm ops most-read:update
 */
import { environment } from '@api/_helpers/environment';
import type { ContentRepository } from '@api/modules/content/content.repository';
import { SanityContentRepository } from '@api/modules/content/content.repository.sanity';
import { updateMostReadLiteraryWorks } from '@api/modules/literary-work/literary-work.service';
import type { OpsTask } from '../registry';

function assertCredentials(): void {
	if (!environment.sanity.projectId) {
		throw new Error('Falta el id del proyecto de Sanity (SANITY_STUDIO_PROJECT_ID).');
	}
	if (!environment.sanity.token) {
		throw new Error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
	}
	if (!environment.clarity.token) {
		throw new Error('Falta el token de Clarity (CLARITY_TOKEN): no hay métrica de la que derivar el ranking.');
	}
}

export async function runMostReadUpdate(
	repository: ContentRepository = new SanityContentRepository(),
): Promise<string[]> {
	console.log(
		`Actualización de más leídas — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}`,
	);

	assertCredentials();

	const { mostRead } = await updateMostReadLiteraryWorks(repository);
	const slugs = mostRead.map(({ slug }) => String(slug));
	if (slugs.length === 0) {
		throw new Error('El ranking quedó vacío: Clarity no devolvió obras leídas o ninguna resolvió a una obra.');
	}

	console.log(`Ranking escrito (${slugs.length} obras):`);
	console.log(slugs.map((slug, index) => `${index + 1}. ${slug}`).join('\n'));
	return slugs;
}

export const task: OpsTask = {
	run: async () => {
		await runMostReadUpdate();
	},
};
