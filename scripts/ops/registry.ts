export type OpsTaskArgs = {
	readonly apply: boolean;
	// Los argumentos propios de la tarea, ya sin el flag global. Una tarea que no los declara no los recibe.
	readonly argv: readonly string[];
};

export const EXIT_CODES = Object.freeze({ success: 0, failure: 1, partial: 2 } as const);

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export type OpsTask = {
	// El código de salida es de la tarea cuando lo devuelve (una medición que encontró hallazgos no es un
	// fallo de la herramienta); sin valor, el dispatcher asume éxito.
	readonly run: (args: OpsTaskArgs) => Promise<ExitCode | void>;
};

export type OpsTaskDescriptor = {
	readonly description: string;
	// Sin corrida en seco posible: el dispatcher la rechaza sin --no-dry-run, antes de cargarla.
	readonly destructive: boolean;
	// Una tarea sin argumentos propios rechaza lo que sobre: el flag mal tipeado no llega a la tarea.
	readonly acceptsArgs: boolean;
	// Diferido a propósito: listar el catálogo no debe cargar los módulos de tarea ni sus dependencias
	// (clientes de Sanity, prettier, Vite); el import se paga recién al ejecutar.
	readonly load: () => Promise<OpsTask>;
};

export type OpsCatalog = Readonly<Record<string, OpsTaskDescriptor>>;

export const OPS_TASKS = Object.freeze({
	config: {
		description: 'Genera los environments de Angular y completa los .env por defecto (build)',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../set-environment').then((m) => m.task),
	},
	'reading-time:backfill': {
		description: 'Persiste el reading time faltante de las obras (dry-run por defecto; --no-dry-run aplica)',
		destructive: false,
		acceptsArgs: false,
		load: () => import('./tasks/backfill-reading-time').then((m) => m.task),
	},
	'most-read:update': {
		description: 'Actualiza el ranking de obras más leídas desde Clarity (escribe siempre; ignora --no-dry-run)',
		destructive: false,
		acceptsArgs: false,
		load: () => import('./tasks/update-most-read').then((m) => m.task),
	},
	'landing-pages:add-next-weeks': {
		description:
			'Pre-genera las landing pages de las próximas semanas (--weeks=<n>; escribe siempre, ignora --no-dry-run)',
		destructive: false,
		acceptsArgs: true,
		load: () => import('./tasks/add-next-weeks-landing-pages').then((m) => m.task),
	},
	'normalize:bare-published-at': {
		description: 'Completa con hora las fechas de publicación desnudas (dry-run por defecto; --no-dry-run aplica)',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../normalize-bare-published-at/normalize-bare-published-at').then((m) => m.task),
	},
	'sanitize:resources-without-url': {
		description: 'Sanea los recursos sin URL de autores y obras (dry-run por defecto; --no-dry-run aplica)',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../sanitize-resources-without-url/sanitize-resources-without-url').then((m) => m.task),
	},
	'assets:delete-unused': {
		description: 'Borra los assets de Sanity sin ninguna referencia (destructivo; requiere --no-dry-run)',
		destructive: true,
		acceptsArgs: false,
		load: () => import('./tasks/delete-unused-assets').then((m) => m.task),
	},
	'drafts:remove-unpublished': {
		description: 'Borra TODOS los borradores no publicados de Sanity (destructivo; requiere --no-dry-run)',
		destructive: true,
		acceptsArgs: false,
		load: () => import('./tasks/remove-unpublished-drafts').then((m) => m.task),
	},
	'check:agents': {
		description: 'Valida la integridad de la config de .claude/ (gate de CI)',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../check-claude-docs').then((m) => m.task),
	},
	'check:findings': {
		description: 'Rechaza identificadores de hallazgo de review en mensajes de commit y cuerpos de PR (gate)',
		destructive: false,
		acceptsArgs: true,
		load: () => import('../check-finding-refs').then((m) => m.task),
	},
	'issue-refs:sweep': {
		description: 'Reporta las menciones a issues que ya no están abiertos; --no-dry-run mantiene el seguimiento',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../issue-refs-sweep').then((m) => m.task),
	},
	'required-fields:sweep': {
		description: 'Cuenta los documentos que incumplen campos requeridos; --no-dry-run mantiene el seguimiento',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../required-fields-sweep/required-fields-sweep').then((m) => m.task),
	},
	'field-shape:sweep': {
		description:
			'Cuenta los campos cuya forma persistida no coincide con el schema; --no-dry-run mantiene el seguimiento',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../field-shape-sweep/field-shape-sweep').then((m) => m.task),
	},
	'worktrees:sweep': {
		description: 'Reporta worktrees sin uso; --no-dry-run remueve los mergeados y archiva sus artefactos',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../worktree-sweep').then((m) => m.task),
	},
	'comments:inventory': {
		description: 'Vuelca a JSON los comentarios de las rutas dadas (lo consume la skill aposd-comment-audit)',
		destructive: false,
		acceptsArgs: true,
		load: () => import('../extract-comments/extract-comments').then((m) => m.task),
	},
	'seo:smoke': {
		description: 'Verifica las invariantes SSR de indexado sobre BASE_URL; --full recorre todo el sitemap',
		destructive: false,
		acceptsArgs: true,
		load: () => import('../seo-smoke').then((m) => m.task),
	},
	'seo:body-sweep': {
		description: 'Barre las URLs del sitemap buscando páginas sin cuerpo; --no-dry-run mantiene el seguimiento',
		destructive: false,
		acceptsArgs: true,
		load: () => import('../seo-body-sweep/seo-body-sweep').then((m) => m.task),
	},
	'seo:index-status': {
		description: 'Mide el indexado real contra Search Console; --no-dry-run deja el aviso en la bitácora',
		destructive: false,
		acceptsArgs: true,
		load: () => import('../seo-index-status/seo-index-status').then((m) => m.task),
	},
	'corpus:generate': {
		description: 'Regenera las fixtures raw del corpus de Onoff evaluando la query GROQ real',
		destructive: false,
		acceptsArgs: false,
		load: () => import('../generate-raw-corpus/generate-raw-corpus').then((m) => m.task),
	},
} as const satisfies Record<string, OpsTaskDescriptor>);
