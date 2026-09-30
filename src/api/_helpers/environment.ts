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
	// Interruptor del `s-maxage` (en segundos) de la caché de borde de la página de lectura: es la ventana de
	// propagación de una edición, no un límite de disponibilidad — el `stale-while-revalidate`
	// cubre el servido mientras el borde revalida.
	readCacheSMaxAge: number;
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

// Default conservador (5 minutos) del `s-maxage` de la página de lectura: acota la staleness sin depender de
// que el interruptor esté seteado. Se sube por entorno con `READ_CACHE_S_MAXAGE`.
export const CONSERVATIVE_READ_CACHE_S_MAXAGE = 300;

// Exportada para test: parsea el valor crudo del interruptor, con fallback al default conservador
// ante un valor ausente, no numérico, no entero o no positivo. El entero no es cosmético: RFC 9111
// define `s-maxage` como delta-seconds entero, así que un `300.7` invalida la directiva y el borde
// deja de cachear en silencio.
export function parseReadCacheSMaxAge(raw: string | undefined): number {
	const parsed = Number(raw);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : CONSERVATIVE_READ_CACHE_S_MAXAGE;
}

export const environment: EnvironmentConfig = {
	production: process.env['VERCEL_TARGET_ENV'] === 'production',
	// TODO: Mover obtención de la URL base a las variables de entorno
	basePath: 'https://www.cuentoneta.ar',
	readCacheSMaxAge: parseReadCacheSMaxAge(process.env['READ_CACHE_S_MAXAGE']),
	sanity: {
		projectId: process.env['SANITY_STUDIO_PROJECT_ID'] as string,
		dataset: process.env['SANITY_STUDIO_DATASET'] as string,
		token: process.env['SANITY_STUDIO_TOKEN'] as string,
	},
	clarity: {
		projectId: process.env['CLARITY_PROJECT_ID'] as string,
		token: process.env['CLARITY_TOKEN'] as string,
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
