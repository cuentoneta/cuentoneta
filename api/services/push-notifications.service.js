const environment = require('../_helpers/environment');

module.exports = {
    getAppId,
};

async function getAppId() {
    return new Promise((resolve, reject) => {
        resolve(environment.oneSignalAppId);
    });
}
