import * as dotenv from 'dotenv';

const result = dotenv.config().parsed;
export let environment: EnvironmentConfig;

if (!!result && !('error' in result)) {
	environment = {
		production: false,
		sanity: {
			projectId: result['SANITY_STUDIO_PROJECT_ID'] as string,
			dataset: result['SANITY_STUDIO_DATASET'] as string,
			token: result['SANITY_STUDIO_TOKEN'] as string,
		},
		twitter: {
			apiKey: result['TWITTER_API_KEY'] as string,
		},
	};
} else {
	environment = {
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
}

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
