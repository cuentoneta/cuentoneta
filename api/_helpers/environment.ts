import * as dotenv from 'dotenv';

const result = dotenv.config().parsed;
export let environment: EnvironmentConfig;

if (!!result && !('error' in result)) {
    environment = {
        oneSignalAppId: result['ONESIGNAL_APP_ID'],
        production: false,
        sanity: {
            projectId: result['SANITY_STUDIO_PROJECT_ID'] as string,
            dataset: result['SANITY_STUDIO_DATASET'] as string,
            token: result['SANITY_STUDIO_TOKEN'] as string,
        },
    };
} else {
    environment = {
        oneSignalAppId: process.env['ONESIGNAL_APP_ID'],
        production: true,
        sanity: {
            projectId: process.env['SANITY_STUDIO_PROJECT_ID'] as string,
            dataset: process.env['SANITY_STUDIO_DATASET'] as string,
            token: process.env['SANITY_STUDIO_TOKEN'] as string,
        },
    };
}

export interface EnvironmentConfig {
    oneSignalAppId?: string;
    production: boolean;
    sanity: {
        token: string;
        projectId: string;
        dataset: string;
    };
}
