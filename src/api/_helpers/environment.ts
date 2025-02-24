export interface EnvironmentConfig {
	production: boolean;
	basePath: string;
	sanity: {
		token: string;
		projectId: string;
		dataset: string;
	};
	clarity: {
		token: string;
	};
	twitter: {
		apiKey: string;
	};
}

export const environment: EnvironmentConfig = {
	production: true,
	// TODO: Mover obtención de la URL base a las variables de entorno
	basePath: 'https://www.cuentoneta.ar',
	sanity: {
		projectId: process.env['SANITY_STUDIO_PROJECT_ID'] as string,
		dataset: process.env['SANITY_STUDIO_DATASET'] as string,
		token: process.env['SANITY_STUDIO_TOKEN'] as string,
	},
	clarity: {
		token: process.env['CLARITY_TOKEN'] as string,
	},
	twitter: {
		apiKey: process.env['TWITTER_API_KEY'] as string,
	},
};
