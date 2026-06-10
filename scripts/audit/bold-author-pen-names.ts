/**
 * Marca en negrita el nombre del autor dentro del campo `biography` de cada
 * documento listado, dejando los cambios como borradores (drafts.*) sin publicar.
 *
 * Para cada autor:
 *   - "in_place": busca el `name` (case-insensitive) dentro del primer span
 *     plano que lo contenga y divide ese span en tres (antes/negrita/después).
 *   - "prepend":  agrega un span en negrita con el `name` al inicio del primer
 *     bloque y antepone un espacio al span original.
 *   - "skip":     se reporta y no se patchea (biografía vacía).
 *
 * Uso:
 *   pnpm exec tsx --env-file=.env scripts/bold-author-pen-names.ts
 */
import { client } from '../../src/api/_helpers/sanity-connector';

type Mode = 'in_place' | 'prepend' | 'skip';

interface Span {
	_key?: string;
	_type: 'span';
	marks?: string[];
	text: string;
}

interface Block {
	_key: string;
	_type: 'block';
	children: Span[];
	markDefs?: unknown[];
	style?: string;
}

interface AuthorDoc {
	_id: string;
	_rev: string;
	_type: 'author';
	name: string;
	slug: { _type: 'slug'; current: string };
	biography: Block[] | null;
	[key: string]: unknown;
}

const OPERATIONS: Array<{ slug: string; mode: Mode; boldText?: string }> = [
	{ slug: 'el-sunset', mode: 'prepend' },
	{ slug: 'elsa-bornemann', mode: 'in_place' },
	{ slug: 'emile-zola', mode: 'prepend' },
	{ slug: 'fernanda-melchor', mode: 'in_place' },
	{ slug: 'george', mode: 'prepend' },
	{ slug: 'george-p-mann', mode: 'in_place' },
	{ slug: 'george-sand', mode: 'in_place' },
	{ slug: 'ginrinoa', mode: 'prepend' },
	{ slug: 'giovanni-bocaccio', mode: 'in_place' },
	{ slug: 'hans-christian-andersen', mode: 'prepend' },
	{ slug: 'hebe-uhart', mode: 'in_place' },
	{ slug: 'herman-hesse', mode: 'prepend' },
	{ slug: 'ignacio-terranova', mode: 'prepend' },
	{ slug: 'irvin-d-yalom', mode: 'prepend' },
	{ slug: 'isabel-allende', mode: 'in_place' },
	{ slug: 'italo-calvino', mode: 'prepend' },
	{ slug: 'james-joyce', mode: 'in_place' },
	{ slug: 'jd-salinger', mode: 'prepend' },
	{ slug: 'jeremias', mode: 'prepend' },
	{ slug: 'joe-r-lansdale', mode: 'prepend' },
	// Bio empieza con "José Alvarado Santos ..." — bolded "José Alvarado" para que
	// coincida con el campo `name` y no se incluya el segundo apellido.
	{ slug: 'jose-alvarado', mode: 'in_place', boldText: 'José Alvarado' },
	{ slug: 'jose-saramago', mode: 'prepend' },
	{ slug: 'josefina-decoud', mode: 'skip' },
	{ slug: 'juan-rulfo', mode: 'in_place' },
	{ slug: 'juana-de-ibarbourou', mode: 'in_place' },
	{ slug: 'judith-garner', mode: 'in_place' },
	{ slug: 'julio-verne', mode: 'in_place' },
	{ slug: 'la-conspiracion-de-los-fuleros', mode: 'prepend' },
	{ slug: 'laura-avila', mode: 'skip' },
	{ slug: 'leila-guerriero', mode: 'prepend' },
	{ slug: 'libertad', mode: 'prepend' },
	{ slug: 'luigi-pirandello', mode: 'prepend' },
	{ slug: 'luisa-valenzuela', mode: 'prepend' },
	{ slug: 'marian-erro', mode: 'prepend' },
	{ slug: 'martin-blasco', mode: 'skip' },
	{ slug: 'mary-shelley', mode: 'prepend' },
	{ slug: 'nancy-a-collins', mode: 'in_place' },
	{ slug: 'nikolai-gogol', mode: 'prepend' },
	{ slug: 'noah-una-vez-mas', mode: 'prepend' },
	{ slug: 'osvaldo-soriano', mode: 'in_place' },
	{ slug: 'patricia-suarez', mode: 'skip' },
	{ slug: 'philip-k-dick', mode: 'prepend' },
	{ slug: 'pimm-van-hest', mode: 'prepend' },
	{ slug: 'rabindranath-tagore', mode: 'in_place' },
	{ slug: 'rick-deckard', mode: 'prepend' },
	{ slug: 'roberto-arlt', mode: 'in_place' },
	{ slug: 'rodolfo-walsh', mode: 'prepend' },
	{ slug: 'rodrigo-fresan', mode: 'skip' },
	{ slug: 'rubem-fonseca', mode: 'in_place' },
	{ slug: 'samanta-schweblin', mode: 'in_place' },
	{ slug: 'shirley-jackson', mode: 'in_place' },
	{ slug: 'svetlana-aleksievich', mode: 'in_place' },
	{ slug: 'sylvia-iparraguirre', mode: 'prepend' },
	{ slug: 'teresa-de-la-parra', mode: 'in_place' },
	{ slug: 'ursula-k-le-guin', mode: 'prepend' },
	{ slug: 'william-f-nolan', mode: 'in_place' },
	{ slug: 'ww-jacobs', mode: 'prepend' },
	{ slug: 'xylofantasia', mode: 'prepend' },
];

const randomKey = () => Math.random().toString(36).slice(2, 14);

const findInPlaceSplit = (
	biography: Block[],
	needle: string,
): { blockIndex: number; spanIndex: number; before: string; match: string; after: string } | null => {
	const lower = needle.toLowerCase();
	for (let bi = 0; bi < biography.length; bi++) {
		const block = biography[bi];
		if (block._type !== 'block' || !Array.isArray(block.children)) continue;
		for (let si = 0; si < block.children.length; si++) {
			const span = block.children[si];
			if (span._type !== 'span' || !span.text) continue;
			if (Array.isArray(span.marks) && span.marks.includes('strong')) continue;
			const idx = span.text.toLowerCase().indexOf(lower);
			if (idx === -1) continue;
			return {
				blockIndex: bi,
				spanIndex: si,
				before: span.text.slice(0, idx),
				match: span.text.slice(idx, idx + needle.length),
				after: span.text.slice(idx + needle.length),
			};
		}
	}
	return null;
};

const buildInPlaceBiography = (biography: Block[], needle: string): Block[] | null => {
	const hit = findInPlaceSplit(biography, needle);
	if (!hit) return null;
	const next = biography.map((b) => ({ ...b, children: [...(b.children ?? [])] }));
	const target = next[hit.blockIndex];
	const original = target.children[hit.spanIndex];
	const baseMarks = (original.marks ?? []).filter((m) => m !== 'strong');
	const replacement: Span[] = [];
	if (hit.before) replacement.push({ _key: randomKey(), _type: 'span', marks: baseMarks, text: hit.before });
	replacement.push({ _key: randomKey(), _type: 'span', marks: [...baseMarks, 'strong'], text: hit.match });
	if (hit.after) replacement.push({ _key: randomKey(), _type: 'span', marks: baseMarks, text: hit.after });
	target.children.splice(hit.spanIndex, 1, ...replacement);
	return next;
};

const buildPrependBiography = (biography: Block[] | null, needle: string): Block[] => {
	const next = (biography ?? []).map((b) => ({ ...b, children: [...(b.children ?? [])] }));
	const boldSpan: Span = { _key: randomKey(), _type: 'span', marks: ['strong'], text: needle };
	if (next.length === 0 || next[0]._type !== 'block') {
		return [
			{
				_key: randomKey(),
				_type: 'block',
				style: 'normal',
				markDefs: [],
				children: [boldSpan],
			},
			...next,
		];
	}
	const firstBlock = next[0];
	const firstChild = firstBlock.children[0];
	const updatedChildren: Span[] = [boldSpan];
	if (firstChild) {
		const leadingSpace = firstChild.text?.startsWith(' ') ? '' : ' ';
		const newFirstText = `${leadingSpace}${firstChild.text ?? ''}`;
		updatedChildren.push({
			...firstChild,
			_key: firstChild._key ?? randomKey(),
			text: newFirstText,
		});
		updatedChildren.push(...firstBlock.children.slice(1));
	}
	firstBlock.children = updatedChildren;
	return next;
};

const stripSystemFields = (doc: AuthorDoc) => {
	const { _rev, _createdAt, _updatedAt, _id, ...rest } = doc as AuthorDoc & {
		_createdAt?: string;
		_updatedAt?: string;
	};
	return { ...rest, _id: `drafts.${_id}` };
};

const run = async () => {
	const slugs = OPERATIONS.map((o) => o.slug);
	const docs: AuthorDoc[] = await client.fetch(
		`*[_type == "author" && !(_id in path("drafts.**")) && slug.current in $slugs]{...}`,
		{ slugs },
	);
	const existingDrafts: Array<{ _id: string; biography: Block[] | null }> = await client.fetch(
		`*[_type == "author" && _id in path("drafts.**") && slug.current in $slugs]{_id, biography}`,
		{ slugs },
	);
	const draftHasBold = new Set<string>();
	for (const d of existingDrafts) {
		const bio = d.biography ?? [];
		const hasStrong = bio.some(
			(b) =>
				b._type === 'block' &&
				Array.isArray(b.children) &&
				b.children.some((c) => Array.isArray(c.marks) && c.marks.includes('strong')),
		);
		if (hasStrong) draftHasBold.add(d._id.replace(/^drafts\./, ''));
	}

	const bySlug = new Map<string, AuthorDoc>();
	for (const d of docs) bySlug.set(d.slug?.current, d);

	const summary: Array<{ slug: string; status: string; reason?: string }> = [];

	for (const op of OPERATIONS) {
		const doc = bySlug.get(op.slug);
		if (!doc) {
			summary.push({ slug: op.slug, status: 'not-found' });
			continue;
		}
		if (draftHasBold.has(doc._id)) {
			summary.push({ slug: op.slug, status: 'skipped', reason: 'existing draft already has bold' });
			continue;
		}
		if (op.mode === 'skip') {
			summary.push({ slug: op.slug, status: 'skipped', reason: 'null biography' });
			continue;
		}
		const needle = op.boldText ?? doc.name;
		let nextBiography: Block[] | null = null;
		if (op.mode === 'in_place') {
			nextBiography = buildInPlaceBiography(doc.biography ?? [], needle);
			if (!nextBiography) {
				// Fall back to prepend if substring missing
				nextBiography = buildPrependBiography(doc.biography, needle);
				summary.push({ slug: op.slug, status: 'fallback-prepend' });
			} else {
				summary.push({ slug: op.slug, status: 'in_place' });
			}
		} else {
			nextBiography = buildPrependBiography(doc.biography, needle);
			summary.push({ slug: op.slug, status: 'prepend' });
		}

		const draftId = `drafts.${doc._id}`;
		const draftSeed = stripSystemFields(doc);

		await client
			.transaction()
			.createIfNotExists(draftSeed as never)
			.patch(draftId, (p) => p.set({ biography: nextBiography }))
			.commit();
	}

	console.log('Done. Summary:');
	for (const s of summary) console.log(` - ${s.slug}: ${s.status}${s.reason ? ` (${s.reason})` : ''}`);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
