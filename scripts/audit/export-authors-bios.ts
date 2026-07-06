/**
 * Exporta el listado de autores publicados con su biografía a archivos Markdown.
 * La salida queda en `tools/author-bios/<slug>.md` y sirve como referencia estilística
 * para la redacción de biografías futuras.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getClient } from '../../src/api/_helpers/sanity-connector';

interface Span {
	_type: 'span';
	text?: string;
	marks?: string[];
}

interface MarkDef {
	_key: string;
	_type: string;
	href?: string;
}

interface Block {
	_type: 'block';
	style?: string;
	children?: Span[];
	markDefs?: MarkDef[];
	listItem?: 'bullet' | 'number';
	level?: number;
}

interface ImageBlock {
	_type: 'image';
	asset?: { _ref?: string };
}

type BlockContentItem = Block | ImageBlock;

interface Author {
	name: string;
	slug: string | null;
	biography: BlockContentItem[] | null;
}

const PRESENTATION_DECORATORS = new Set(['left', 'center', 'right', 'justify']);

const renderSpan = (span: Span, markDefs: MarkDef[]): string => {
	const raw = span.text ?? '';
	if (!raw) return '';

	const linkMarks: string[] = [];
	const inlineMarks: string[] = [];
	for (const mark of span.marks ?? []) {
		if (PRESENTATION_DECORATORS.has(mark)) continue;
		if (mark === 'strong' || mark === 'em' || mark === 'code') {
			inlineMarks.push(mark);
		} else {
			linkMarks.push(mark);
		}
	}

	if (inlineMarks.length === 0 && linkMarks.length === 0) return raw;

	// CommonMark requires emphasis markers to be flanked by non-whitespace,
	// so move any leading/trailing whitespace outside the wrapping.
	const leading = raw.match(/^\s*/)?.[0] ?? '';
	const trailing = raw.match(/\s*$/)?.[0] ?? '';
	const inner = raw.slice(leading.length, raw.length - trailing.length);
	if (!inner) return raw;

	let wrapped = inner;
	if (inlineMarks.includes('code')) wrapped = `\`${wrapped}\``;
	if (inlineMarks.includes('em')) wrapped = `_${wrapped}_`;
	if (inlineMarks.includes('strong')) wrapped = `**${wrapped}**`;

	for (const key of linkMarks) {
		const def = markDefs.find((d) => d._key === key);
		if (def?._type === 'link' && def.href) wrapped = `[${wrapped}](${def.href})`;
	}

	return `${leading}${wrapped}${trailing}`;
};

const renderBlock = (block: Block): string => {
	const text = (block.children ?? []).map((s) => renderSpan(s, block.markDefs ?? [])).join('');

	if (block.listItem) {
		const indent = '  '.repeat(Math.max(0, (block.level ?? 1) - 1));
		const marker = block.listItem === 'number' ? '1.' : '-';
		return `${indent}${marker} ${text}`;
	}

	switch (block.style) {
		case 'h1':
			return `# ${text}`;
		case 'h2':
			return `## ${text}`;
		case 'h3':
			return `### ${text}`;
		case 'h4':
			return `#### ${text}`;
		case 'h5':
			return `##### ${text}`;
		case 'h6':
			return `###### ${text}`;
		case 'blockquote':
			return `> ${text}`;
		default:
			return text;
	}
};

const blockContentToMarkdown = (blocks: BlockContentItem[]): string =>
	blocks
		.map((item) => {
			if (item._type === 'block') return renderBlock(item);
			if (item._type === 'image') return `![](${item.asset?._ref ?? ''})`;
			return '';
		})
		.filter((line) => line.trim().length > 0)
		.join('\n\n');

const slugify = (input: string): string =>
	input
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

const exportBiographies = async () => {
	console.log('='.repeat(60));
	console.log('Exportando biografías de autores a Markdown');
	console.log('='.repeat(60));

	const authors = await getClient().fetch<Author[]>(
		`*[_type == 'author' && !(_id in path('drafts.**')) && defined(biography)]{
			name,
			'slug': slug.current,
			biography
		} | order(name asc)`,
	);

	console.log(`\nAutores encontrados: ${authors.length}`);

	const outputDir = join(process.cwd(), 'tools', 'author-bios');
	await mkdir(outputDir, { recursive: true });

	let written = 0;
	let skipped = 0;
	for (const author of authors) {
		const body = blockContentToMarkdown(author.biography ?? []);
		if (!body.trim()) {
			console.log(`- omitido: ${author.name} (biografía vacía)`);
			skipped++;
			continue;
		}
		const filename = `${author.slug || slugify(author.name)}.md`;
		const content = `# ${author.name}\n\n${body}\n`;
		await writeFile(join(outputDir, filename), content, 'utf8');
		written++;
	}

	console.log(`\n✓ Archivos escritos: ${written}`);
	console.log(`  Omitidos:        ${skipped}`);
	console.log(`  Carpeta:         ${outputDir}`);
};

exportBiographies().catch((err) => {
	console.error('\nLa exportación falló:', err);
	process.exit(1);
});
