export type OpsTaskArgs = {
	readonly apply: boolean;
};

export type OpsTask = {
	readonly run: (args: OpsTaskArgs) => Promise<void>;
};

export type OpsTaskDescriptor = {
	readonly description: string;
	// Diferido a propósito: cada módulo de tarea abre la conexión a Sanity al importarse, y listar el
	// catálogo no puede pagar ese costo.
	readonly load: () => Promise<OpsTask>;
};

export const OPS_TASKS = Object.freeze({
	'reading-time:backfill': {
		description: 'Persiste el reading time faltante de las obras (dry-run por defecto; --no-dry-run aplica)',
		load: () => import('./tasks/backfill-reading-time').then((m) => m.task),
	},
	'assets:delete-unused': {
		description: 'Borra los assets de Sanity sin ninguna referencia (destructivo)',
		load: () => import('./tasks/delete-unused-assets').then((m) => m.task),
	},
	'drafts:remove-unpublished': {
		description: 'Borra TODOS los borradores no publicados de Sanity (destructivo)',
		load: () => import('./tasks/remove-unpublished-drafts').then((m) => m.task),
	},
} as const satisfies Record<string, OpsTaskDescriptor>);
