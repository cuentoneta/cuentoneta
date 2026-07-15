import {
	checkCanonical,
	checkInternalLink,
	checkJsonLdBlocksPresent,
	checkNoSkeletonMarkers,
	checkPrimaryContentLength,
	checkPrimaryHeading,
	checkRobotsIndexable,
	checkNgServerContext,
	checkTitle,
	collectIndexableHtmlViolations,
	type IndexableHtmlExpectations,
} from './seo-invariants';

const primaryText = 'texto '.repeat(40); // 240 caracteres, por encima del umbral por defecto (120)

const GOOD_HTML = `<!doctype html><html ng-server-context="ssr"><head>
	<title>El Aleph — La Cuentoneta</title>
	<link rel="canonical" href="https://www.cuentoneta.org/story/el-aleph" />
	<meta name="robots" content="index, follow" />
	<script type="application/ld+json" data-schema-id="organization">{"@type":"Organization"}</script>
	<script type="application/ld+json" data-schema-id="website">{"@type":"WebSite"}</script>
</head><body>
	<header><h1>chrome fuera de main</h1></header>
	<main><h1>El Aleph</h1><p>${primaryText}</p><a href="/author/jorge-luis-borges">Borges</a></main>
	<footer>pie</footer>
</body></html>`;

const GOOD_EXPECTATIONS: IndexableHtmlExpectations = {
	path: '/story/el-aleph',
	titlePattern: /aleph/i,
	h1Pattern: /aleph/i,
	requiredJsonLdIds: ['organization', 'website'],
	requiredInternalLinkPrefix: '/author/',
};

describe('checkNgServerContext', () => {
	it('pasa con ng-server-context="ssr"', () => {
		expect(checkNgServerContext(GOOD_HTML)).toBeNull();
	});

	it('viola con el deopt a CSR (ssg) e informa el valor encontrado', () => {
		const violation = checkNgServerContext(GOOD_HTML.replace('"ssr"', '"ssg"'));
		expect(violation?.rule).toBe('server-render-context');
		expect(violation?.message).toContain('ssg');
	});

	it('viola cuando el atributo está ausente', () => {
		expect(checkNgServerContext('<html><head></head><body></body></html>')?.message).toContain('(ausente)');
	});
});

describe('checkTitle', () => {
	it('pasa con título no vacío que matchea el patrón', () => {
		expect(checkTitle(GOOD_HTML, /aleph/i)).toBeNull();
	});

	it('viola con título vacío', () => {
		expect(checkTitle('<head><title></title></head>')?.rule).toBe('title');
	});

	it('viola cuando el patrón no matchea', () => {
		expect(checkTitle(GOOD_HTML, /borges/i)?.rule).toBe('title');
	});
});

describe('checkCanonical', () => {
	it('pasa cuando la canónica contiene el path', () => {
		expect(checkCanonical(GOOD_HTML, '/story/el-aleph')).toBeNull();
	});

	it('viola cuando la canónica apunta a otro path', () => {
		expect(checkCanonical(GOOD_HTML, '/story/otro-cuento')?.rule).toBe('canonical');
	});

	it('viola cuando no hay canónica', () => {
		expect(checkCanonical('<head></head>', '/home')?.message).toContain('(ausente)');
	});
});

describe('checkRobotsIndexable', () => {
	it('pasa con index, follow', () => {
		expect(checkRobotsIndexable(GOOD_HTML)).toBeNull();
	});

	it('viola con noindex', () => {
		expect(checkRobotsIndexable('<meta name="robots" content="noindex, follow" />')?.rule).toBe('robots-indexable');
	});

	it('viola cuando no hay meta robots', () => {
		expect(checkRobotsIndexable('<head></head>')?.rule).toBe('robots-indexable');
	});
});

describe('checkPrimaryHeading', () => {
	it('pasa con un h1 real dentro de main que matchea el patrón', () => {
		expect(checkPrimaryHeading(GOOD_HTML, /aleph/i)).toBeNull();
	});

	it('ignora los h1 fuera de main (chrome del header)', () => {
		const noHeadingInMain = '<header><h1>logo</h1></header><main><p>sin heading</p></main>';
		expect(checkPrimaryHeading(noHeadingInMain)?.rule).toBe('primary-heading');
	});

	it('viola con h1 vacío', () => {
		expect(checkPrimaryHeading('<main><h1>   </h1></main>')?.rule).toBe('primary-heading');
	});

	it('viola cuando el patrón no matchea ningún h1', () => {
		expect(checkPrimaryHeading('<main><h1>Otro título</h1></main>', /aleph/i)?.rule).toBe('primary-heading');
	});

	it('no muta el lastIndex de un patrón con flag g (no arrastra estado entre h1)', () => {
		const pattern = /aleph/gi;
		checkPrimaryHeading('<main><h1>El Aleph</h1></main>', pattern);
		expect(pattern.lastIndex).toBe(0);
	});
});

describe('checkPrimaryContentLength', () => {
	it('pasa cuando el texto de main supera el umbral', () => {
		expect(checkPrimaryContentLength(GOOD_HTML)).toBeNull();
	});

	it('viola cuando el texto de main es demasiado corto', () => {
		expect(checkPrimaryContentLength('<main><p>hola</p></main>')?.rule).toBe('primary-content');
	});

	it('respeta un umbral custom', () => {
		expect(checkPrimaryContentLength('<main><p>hola mundo</p></main>', 5)).toBeNull();
	});
});

describe('checkNoSkeletonMarkers', () => {
	it('pasa cuando no hay markers de skeleton en main', () => {
		expect(checkNoSkeletonMarkers(GOOD_HTML)).toBeNull();
	});

	it('viola cuando hay un skeleton dentro de main', () => {
		expect(checkNoSkeletonMarkers('<main><div data-testid="skeleton"></div></main>')?.rule).toBe('no-skeleton');
	});

	it('ignora skeletons fuera de main', () => {
		expect(checkNoSkeletonMarkers('<header data-testid="skeleton"></header><main><p>ok</p></main>')).toBeNull();
	});
});

describe('checkInternalLink', () => {
	it('pasa cuando hay un enlace con el prefijo dentro de main', () => {
		expect(checkInternalLink(GOOD_HTML, '/author/')).toBeNull();
	});

	it('viola cuando no hay enlace con el prefijo', () => {
		expect(checkInternalLink(GOOD_HTML, '/story/')?.rule).toBe('internal-link');
	});

	it('ignora enlaces fuera de main', () => {
		expect(checkInternalLink('<header><a href="/story/x">x</a></header><main><p>ok</p></main>', '/story/')?.rule).toBe(
			'internal-link',
		);
	});
});

describe('checkJsonLdBlocksPresent', () => {
	it('no devuelve violaciones cuando están todos los ids', () => {
		expect(checkJsonLdBlocksPresent(GOOD_HTML, ['organization', 'website'])).toEqual([]);
	});

	it('reporta cada id faltante', () => {
		const violations = checkJsonLdBlocksPresent(GOOD_HTML, ['organization', 'article']);
		expect(violations).toHaveLength(1);
		expect(violations[0].message).toContain('article');
	});

	it('reporta JSON-LD malformado como violación en vez de tirar', () => {
		const malformed = '<script data-schema-id="organization">{ malformado }</script>';
		const violations = checkJsonLdBlocksPresent(malformed, ['organization']);
		expect(violations[0].rule).toBe('json-ld');
		expect(violations[0].message).toContain('parsear');
	});
});

describe('collectIndexableHtmlViolations', () => {
	it('no devuelve violaciones para un HTML indexable completo', () => {
		expect(collectIndexableHtmlViolations(GOOD_HTML, GOOD_EXPECTATIONS)).toEqual([]);
	});

	it('acumula todas las violaciones simultáneas (no fail-fast)', () => {
		const broken =
			'<html ng-server-context="ssg"><head><title></title></head><body><main><div data-testid="skeleton"></div></main></body></html>';
		const rules = collectIndexableHtmlViolations(broken, GOOD_EXPECTATIONS).map((violation) => violation.rule);
		expect(rules).toEqual(
			expect.arrayContaining([
				'server-render-context',
				'title',
				'canonical',
				'robots-indexable',
				'primary-heading',
				'primary-content',
				'no-skeleton',
				'internal-link',
				'json-ld',
			]),
		);
	});

	it('afirma la canónica con canonicalContains cuando difiere del path', () => {
		const homeLike = GOOD_HTML.replace('/story/el-aleph', 'https://www.cuentoneta.org');
		const expectations = { path: '/home', requiredJsonLdIds: [], canonicalContains: 'cuentoneta.org' };
		expect(collectIndexableHtmlViolations(homeLike, expectations).map((violation) => violation.rule)).not.toContain(
			'canonical',
		);
	});

	it('omite el check de enlace interno cuando no se pide prefijo', () => {
		const rules = collectIndexableHtmlViolations(GOOD_HTML, {
			...GOOD_EXPECTATIONS,
			requiredInternalLinkPrefix: undefined,
		}).map((violation) => violation.rule);
		expect(rules).not.toContain('internal-link');
	});
});
