import * as dotenv from 'dotenv';
import { ContentConfig } from '../../src/app/models/content.model';

const result = dotenv.config().parsed;
export let environment: EnvironmentConfig;

if (!!result && !('error' in result)) {
    environment = {
        oneSignalAppId: result['ONESIGNAL_APP_ID'],
        production: false,
        contentConfig: JSON.parse(result['CUENTONETA_CONTENT']),
        sanity: {
            projectId: result['SANITY_PROJECT_ID'] as string,
            dataset: result['SANITY_DATASET'] as string,
            token: result['SANITY_TOKEN'] as string,
        },
    };
} else {
    environment = {
        oneSignalAppId: process.env['ONESIGNAL_APP_ID'],
        production: true,
        contentConfig: JSON.parse(process.env['CUENTONETA_CONTENT']),
        sanity: {
            projectId: process.env['SANITY_PROJECT_ID'] as string,
            dataset: process.env['SANITY_DATASET'] as string,
            token: process.env['SANITY_TOKEN'] as string,
        },
    };
}

export interface EnvironmentConfig {
    oneSignalAppId?: string;
    production: boolean;
    contentConfig: ContentConfig;
    sanity: {
        token: string;
        projectId: string;
        dataset: string;
    };
}
