const result = require('dotenv').config();
const _ = require('lodash');

let environment;

if (!('error' in result)) {
    environment = {
        sanity: {
            projectId: result.parsed.SANITY_PROJECT_ID,
            dataset: result.parsed.SANITY_DATASET,
        },
    };
} else {
    environment = {
        sanity: {
            projectId: process.env.SANITY_PROJECT_ID,
            dataset: process.env.SANITY_DATASET,
        },
    };
}

module.exports = environment;
