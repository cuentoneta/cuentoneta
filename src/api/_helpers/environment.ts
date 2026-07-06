// Carga el archivo .env en el contexto de prerendering, donde las variables
// de entorno no son inyectadas automáticamente por Nx/Angular.
try {
	process.loadEnvFile();
} catch {
	// En producción (Vercel) las variables son inyectadas por la plataforma.
	console.info(
		'process.loadEnvFile() no disponible o .env no encontrado. Se asume entorno de producción donde las variables son inyectadas por la plataforma.',
	);
}

export interface EnvironmentConfig {
	production: boolean;
	basePath: string;
	sanity: {
		token: string;
		projectId: string;
		dataset: string;
	};
	clarity: {
		projectId: string;
		token: string;
	};
}

// Getters: leen `process.env` en el momento del acceso, no al evaluar el módulo. Motivo: en
// Cloudflare Workers las env vars llegan por request (el worker las copia a process.env antes de
// atender); en Node/Vercel ya están al importar, así que el comportamiento es idéntico.
export const environment: EnvironmentConfig = {
	// `APP_ENV` es el flag de entorno propio de la app (host-agnóstico), reemplaza a `VERCEL_TARGET_ENV`.
	get production() {
		return process.env['APP_ENV'] === 'production';
	},
	// URL base para canónicas, host-agnóstica vía `SITE_URL` (sin barra final para componer).
	get basePath() {
		return (process.env['SITE_URL'] ?? 'https://www.cuentoneta.ar').replace(/\/$/, '');
	},
	sanity: {
		get projectId() {
			return process.env['SANITY_STUDIO_PROJECT_ID'] as string;
		},
		get dataset() {
			return process.env['SANITY_STUDIO_DATASET'] as string;
		},
		get token() {
			return process.env['SANITY_STUDIO_TOKEN'] as string;
		},
	},
	clarity: {
		get projectId() {
			return process.env['CLARITY_PROJECT_ID'] as string;
		},
		get token() {
			return process.env['CLARITY_TOKEN'] as string;
		},
	},
};

/**
 * A partir de la versión 21.1 de Angular, para SSR, debe proveerse una whitelist
 * de hostnames para dar por válidas las requests que atiende el servidor (Node o Workers).
 */
export function getAllowedHosts(): string[] {
	const hosts = ['localhost', '127.0.0.1', 'cuentoneta.ar', '*.cuentoneta.ar'];
	if (!environment.production) {
		// Dominios de preview: Cloudflare Workers (`*.workers.dev`).
		hosts.push('*.workers.dev');
	}
	return hosts;
}
