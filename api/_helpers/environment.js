const result = require('dotenv').config();

let environment;

if (!('error' in result)) {
    environment = {
        oneSignalAppId: result.parsed.ONESIGNAL_APP_ID,
        sanity: {
            projectId: result.parsed.SANITY_PROJECT_ID,
            dataset: result.parsed.SANITY_DATASET,
        },
    };
} else {
    environment = {
        oneSignalAppId: process.env.ONESIGNAL_APP_ID,
        sanity: {
            projectId: process.env.SANITY_PROJECT_ID,
            dataset: process.env.SANITY_DATASET,
        },
    };
}

module.exports = environment;
