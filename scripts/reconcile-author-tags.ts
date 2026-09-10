import { randomUUID } from 'node:crypto';
import { reconcileAuthorTagsAuthorsQuery } from '@queries/author.query';
import { reconcileAuthorTagsWorksQuery } from '@queries/literary-work.query';
import { client } from '../src/api/_helpers/sanity-connector';
import { environment } from '../src/api/_helpers/environment';
import { collectDerivedTags, planAuthorTagPatches, type AuthorTagPatchPlan } from './reconcile-author-tags.helpers';

// El connector sirve de la CDN en producción: la reconciliación tiene que leer el estado real,
// no uno cacheado.
const sanityClient = client.withConfig({ useCdn: false });

async function run(): Promise<void> {
	return environment.sanity.token ? reconcileAndReport() : abortMissingToken();
}

function abortMissingToken(): void {
	console.error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
	process.exitCode = 1;
}

async function reconcileAndReport(): Promise<void> {
	const works = await sanityClient.fetch(reconcileAuthorTagsWorksQuery);
	const authors = await sanityClient.fetch(reconcileAuthorTagsAuthorsQuery);
	const derivedByAuthor = collectDerivedTags(works);
	const plans = planAuthorTagPatches(authors, derivedByAuthor);
	await commitPlans(plans);
	console.log(`Autores reconciliados: ${plans.length} de ${derivedByAuthor.size} con tags derivados.`);
}

async function commitPlans(plans: ReadonlyArray<AuthorTagPatchPlan>): Promise<void> {
	const transaction = plans.reduce(
		(tx, plan) => tx.patch(plan.authorId, (patch) => patch.set({ tags: buildTagReferences(plan) })),
		sanityClient.transaction(),
	);
	await (plans.length === 0 ? Promise.resolve() : transaction.commit());
}

function buildTagReferences(plan: AuthorTagPatchPlan): Array<{ _key: string; _ref: string; _type: 'reference' }> {
	return [
		...plan.kept.map((tag) => ({ _key: tag._key, _ref: tag._ref, _type: 'reference' as const })),
		...plan.missing.map((ref) => ({ _key: randomUUID(), _ref: ref, _type: 'reference' as const })),
	];
}

run().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
