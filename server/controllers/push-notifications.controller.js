const express = require('express');
const router = express.Router();

const pushNotificationsService = require('../services/push-notifications.service');
router.get('/getAppId', getAppId);

module.exports = router;

function getAppId(req, res, next) {
    return pushNotificationsService
        .getAppId()
        .then((result) => res.json(result))
        .catch((err) => next(err));
}
