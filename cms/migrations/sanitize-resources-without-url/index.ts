import { at, defineMigration, set, unset } from 'sanity/migrate';

// `Rule.required()` sobre `url` valida la edición en el Studio, no lo ya almacenado: quedaron
// documentos —anteriores a la regla, o escritos por script— con un recurso sin enlace. En el autor
// eso reventaba el constructor de la Persona y dejaba su ficha y sus obras sin cuerpo en SSR; en la
// obra renderiza un enlace sin destino. Esta migración cierra el hueco en los datos; que la
// aplicación resista el caso lo garantiza el ACL.

// El artículo de Wikipedia que cada recurso prometía, verificado uno por uno contra la API de
// MediaWiki. Un autor ausente de este mapa pierde su recurso: es la disposición de quien no tiene
// artículo al que apuntar.
const AUTHOR_RESOURCE_URLS: Readonly<Record<string, string>> = {
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

interface MigratedResource {
	_key: string;
	url?: string | null;
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

// El `_key` se lee del documento y la disposición se indexa por slug: los `_key` del censo salieron
// de production y la migración corre en los tres datasets, donde no hay garantía de que coincidan.
function migrateAuthor(document: MigratedDocument, incomplete: MigratedResource[]) {
	const slug = document.slug?.current;

	// Un autor que se sume después no debe pasar en silencio por una migración que cree haberlo
	// cubierto: sin entrada en el mapa ni en la lista de excepciones, no hay disposición que aplicar.
	if (!slug || (!(slug in AUTHOR_RESOURCE_URLS) && !AUTHORS_WITHOUT_ARTICLE.includes(slug))) {
		throw new Error(
			`El autor "${slug ?? document._id}" tiene un recurso sin URL y no figura en la tabla de disposición`,
		);
	}

	const url = AUTHOR_RESOURCE_URLS[slug];
	return incomplete.map((resource) =>
		url
			? at(['resources', { _key: resource._key }, 'url'], set(url))
			: at(['resources', { _key: resource._key }], unset()),
	);
}

// En la obra no hay tabla: el recurso se titula siempre "Enlace a recurso original" y no nombra
// ningún destino averiguable, así que la única disposición posible es borrarlo. Al no enumerar
// documentos, un caso nuevo con el mismo hueco queda cubierto por definición.
function discardResources(incomplete: MigratedResource[]) {
	return incomplete.map((resource) => at(['resources', { _key: resource._key }], unset()));
}

export default defineMigration({
	title: 'Sanear los recursos sin URL de autores y obras',
	documentTypes: ['author', 'story', 'literaryWork'],
	migrate: {
		document(document: MigratedDocument) {
			const incomplete = (document.resources ?? []).filter(lacksUrl);
			if (incomplete.length === 0) {
				return [];
			}

			return document._type === 'author' ? migrateAuthor(document, incomplete) : discardResources(incomplete);
		},
	},
});
