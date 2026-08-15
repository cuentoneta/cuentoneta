import { at, defineMigration, set, unset } from 'sanity/migrate';

// `Rule.required()` sobre `url` valida la edición en el Studio, no lo ya almacenado: quedaron
// documentos —anteriores a la regla, o escritos por script— con un recurso sin enlace. En el autor
// eso reventaba el constructor de la Persona y dejaba su ficha y sus obras sin cuerpo en SSR; en la
// obra renderiza un enlace sin destino. Esta migración cierra el hueco en los datos; que la
// aplicación resista el caso lo garantiza el ACL.

// El artículo de Wikipedia que cada recurso prometía, verificado uno por uno contra la API de
// MediaWiki. Un autor ausente de este mapa pierde su recurso: es la disposición de quien no tiene
// artículo al que apuntar.
const AUTHOR_RESOURCE_URLS: Readonly<Partial<Record<string, string>>> = {
	'algernon-blackwood': 'https://es.wikipedia.org/wiki/Algernon_Blackwood',
	'ambrose-bierce': 'https://es.wikipedia.org/wiki/Ambrose_Bierce',
	'don-juan-manuel': 'https://es.wikipedia.org/wiki/Don_Juan_Manuel',
	'eta-hoffmann': 'https://es.wikipedia.org/wiki/E._T._A._Hoffmann',
	'frida-kahlo': 'https://es.wikipedia.org/wiki/Frida_Kahlo',
	'h-rider-haggard': 'https://es.wikipedia.org/wiki/H._Rider_Haggard',
	'jean-ray': 'https://es.wikipedia.org/wiki/Jean_Ray',
	'khalil-gibran': 'https://es.wikipedia.org/wiki/Yibr%C3%A1n_Jalil_Yibr%C3%A1n',
	'kurt-vonnegut': 'https://es.wikipedia.org/wiki/Kurt_Vonnegut',
	'leon-tolstoi': 'https://es.wikipedia.org/wiki/Le%C3%B3n_Tolst%C3%B3i',
	'margaret-st-clair': 'https://es.wikipedia.org/wiki/Margaret_St._Clair',
	'natalia-ginzburg': 'https://es.wikipedia.org/wiki/Natalia_Ginzburg',
	'nathaniel-hawthorne': 'https://es.wikipedia.org/wiki/Nathaniel_Hawthorne',
	'neil-gaiman': 'https://es.wikipedia.org/wiki/Neil_Gaiman',
	'selma-lagerlof': 'https://es.wikipedia.org/wiki/Selma_Lagerl%C3%B6f',
	'the-monty-python': 'https://es.wikipedia.org/wiki/Monty_Python',
};

// El único autor cuyo recurso se borra en vez de completarse: "Anónimo" no nombra a una persona, y
// el artículo al que redirige trata sobre el anonimato como concepto.
const AUTHORS_WITHOUT_ARTICLE: readonly string[] = ['anonimo'];

// El título con el que se cargaron los recursos incompletos de las obras. La disposición de borrarlos
// se apoya en que ese título no nombra ningún destino averiguable, así que la migración lo verifica
// en vez de darlo por cierto: es su única operación destructiva.
const WORK_RESOURCE_TITLE = 'Enlace a recurso original';

// Dos perfiles cargados sin protocolo, que la validación de forma del schema rechazaría. Se indexan
// por su URL literal porque es el dato que identifica al recurso, y no hay dos iguales.
const SCHEMELESS_URL_FIXES: Readonly<Partial<Record<string, string>>> = {
	'instagram.com/conspiraciondelosfuleros': 'https://instagram.com/conspiraciondelosfuleros',
	'youtube.com/@conspiraciondelosfuleros7233': 'https://youtube.com/@conspiraciondelosfuleros7233',
};

interface MigratedResource {
	_key: string;
	url?: string | null;
	title?: string;
}

interface MigratedDocument {
	_id: string;
	_type: string;
	slug?: { current?: string };
	resources?: MigratedResource[];
}

function lacksUrl(resource: MigratedResource): boolean {
	return typeof resource.url !== 'string' || resource.url.length === 0;
}

function isDraft(document: MigratedDocument): boolean {
	return document._id.startsWith('drafts.');
}

// El `_key` se lee del documento y la disposición se indexa por slug: los `_key` del censo salieron
// de production y la migración corre en los tres datasets, donde no hay garantía de que coincidan.
function migrateAuthor(document: MigratedDocument, incomplete: MigratedResource[]) {
	const slug = document.slug?.current ?? '';
	const url = AUTHOR_RESOURCE_URLS[slug];

	// Un autor que se sume después no debe pasar en silencio por una migración que cree haberlo
	// cubierto: sin entrada en el mapa ni en la lista de excepciones, no hay disposición que aplicar.
	// El borrador es la excepción: una fila de recurso a medio completar es el estado normal apenas se
	// agrega un ítem en el Studio, y abortar por eso detendría la corrida sobre contenido publicado.
	if (!url && !AUTHORS_WITHOUT_ARTICLE.includes(slug)) {
		if (isDraft(document)) {
			return [];
		}
		throw new Error(
			`El autor "${slug || document._id}" tiene un recurso sin URL y no figura en la tabla de disposición`,
		);
	}

	// La tabla asigna una URL por autor, así que dos recursos incompletos en el mismo documento
	// quedarían apuntando ambos al mismo artículo. El censo dice que no pasa; esto lo afirma.
	if (url && incomplete.length > 1) {
		throw new Error(`El autor "${slug}" tiene ${incomplete.length} recursos sin URL y la tabla asigna una sola`);
	}

	return incomplete.map((resource) =>
		url
			? at(['resources', { _key: resource._key }, 'url'], set(url))
			: at(['resources', { _key: resource._key }], unset()),
	);
}

// En la obra no hay tabla: el recurso no nombra ningún destino averiguable, así que la única
// disposición posible es borrarlo. Al no enumerar documentos, un caso nuevo con el mismo hueco queda
// cubierto por definición — siempre que sea el mismo caso, que es lo que verifica el título.
function discardWorkResources(document: MigratedDocument, incomplete: MigratedResource[]) {
	const unexpected = incomplete.find((resource) => resource.title !== WORK_RESOURCE_TITLE);
	if (unexpected) {
		throw new Error(
			`La obra "${document.slug?.current ?? document._id}" tiene un recurso sin URL titulado "${unexpected.title}", ajeno al lote que esta migración borra`,
		);
	}

	return incomplete.map((resource) => at(['resources', { _key: resource._key }], unset()));
}

// La validación de forma del schema rechaza una URL sin protocolo, y el saneamiento sería inútil si
// dejara documentos que la incumplen por otro motivo que el hueco.
function completeSchemelessUrls(resources: MigratedResource[]) {
	return resources.flatMap((resource) => {
		const fixed = typeof resource.url === 'string' ? SCHEMELESS_URL_FIXES[resource.url] : undefined;
		return fixed ? [at(['resources', { _key: resource._key }, 'url'], set(fixed))] : [];
	});
}

export default defineMigration({
	title: 'Sanear los recursos sin URL de autores y obras',
	documentTypes: ['author', 'story', 'literaryWork'],
	migrate: {
		document(document: MigratedDocument) {
			const resources = document.resources ?? [];
			const incomplete = resources.filter(lacksUrl);
			const schemeless = completeSchemelessUrls(resources);

			if (incomplete.length === 0) {
				return schemeless;
			}

			const patches =
				document._type === 'author' ? migrateAuthor(document, incomplete) : discardWorkResources(document, incomplete);
			return [...patches, ...schemeless];
		},
	},
});
