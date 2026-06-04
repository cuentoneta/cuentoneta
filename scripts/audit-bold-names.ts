/**
 * Audita el dataset `production` y reporta los slugs de autores cuya `name`
 * no aparece (case-insensitive, trim) como subcadena contigua de algún span
 * con marca `strong` dentro de su biografía publicada.
 *
 * Uso:
 *   pnpm exec tsx --env-file=.env scripts/audit-bold-names.ts
 */
import { client } from '../src/api/_helpers/sanity-connector';

interface Result {
	slug: string | null;
	name: string;
	boldTexts: string[] | null;
}

const run = async () => {
	const results: Result[] = await client.fetch(
		`*[_type == "author" && !(_id in path("drafts.**"))] | order(slug.current asc) {
			"slug": slug.current,
			name,
			"boldTexts": biography[_type == "block"].children[("strong" in marks)].text
		}`,
	);

	const missing: Array<{ slug: string | null; name: string; reason: 'no-bold' | 'name-not-in-bold'; bold?: string[] }> =
		[];
	for (const r of results) {
		const needle = (r.name ?? '').trim().toLowerCase();
		const bold = (r.boldTexts ?? []).filter((t): t is string => typeof t === 'string');
		if (bold.length === 0) {
			missing.push({ slug: r.slug, name: r.name, reason: 'no-bold' });
			continue;
		}
		const hit = bold.some((t) => t.toLowerCase().includes(needle));
		if (!hit) missing.push({ slug: r.slug, name: r.name, reason: 'name-not-in-bold', bold });
	}

	console.log(`Total authors (published): ${results.length}`);
	console.log(`Missing: ${missing.length}\n`);

	const groupA = missing.filter((m) => m.reason === 'no-bold');
	const groupB = missing.filter((m) => m.reason === 'name-not-in-bold');

	console.log(`Group A — no bold spans at all (${groupA.length}):`);
	for (const m of groupA) console.log(`  ${m.slug ?? '(no slug)'}  — ${m.name}`);
	console.log(`\nGroup B — bold present but name not contained (${groupB.length}):`);
	for (const m of groupB) console.log(`  ${m.slug ?? '(no slug)'}  — ${m.name}  ←  bold: ${JSON.stringify(m.bold)}`);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
