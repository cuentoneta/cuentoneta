const environment = require('../_helpers/environment');

export default function getAppId(req, res) {
    res.json(environment.oneSignalAppId);
}
