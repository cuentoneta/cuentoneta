export interface EnvironmentConfig {
	production: boolean;
	sanity: {
		token: string;
		projectId: string;
		dataset: string;
	};
	twitter: {
		apiKey: string;
	};
}

export const environment: EnvironmentConfig = {
	production: true,
	sanity: {
		projectId: process.env['SANITY_STUDIO_PROJECT_ID'] as string,
		dataset: process.env['SANITY_STUDIO_DATASET'] as string,
		token: process.env['SANITY_STUDIO_TOKEN'] as string,
	},
	twitter: {
		apiKey: process.env['TWITTER_API_KEY'] as string,
	},
};
