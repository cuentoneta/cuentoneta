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
	twitter: {
		apiKey: string;
	};
}

export const environment: EnvironmentConfig = {
	production: process.env['VERCEL_TARGET_ENV'] === 'production',
	// TODO: Mover obtención de la URL base a las variables de entorno
	basePath: 'https://www.cuentoneta.ar',
	sanity: {
		projectId: process.env['SANITY_STUDIO_PROJECT_ID'] as string,
		dataset: process.env['SANITY_STUDIO_DATASET'] as string,
		token: process.env['SANITY_STUDIO_TOKEN'] as string,
	},
	clarity: {
		projectId: process.env['CLARITY_PROJECT_ID'] as string,
		token: process.env['CLARITY_TOKEN'] as string,
	},
	twitter: {
		apiKey: process.env['TWITTER_API_KEY'] as string,
	},
};

/**
 * A partir de la versión 21.1 de Angular, para SSR, debe proveerse una whitelist
 * de hostnames para dar por válidas las requests que debe responder el servidor
 * de NodeJS
 */
export function getAllowedHosts(): string[] {
	const hosts = ['localhost', 'cuentoneta.ar', '*.cuentoneta.ar'];
	if (!environment.production) {
		hosts.push('*.vercel.app');
	}
	return hosts;
}
