const express = require('express');
const router = express.Router();
const service = require('../services/story.service');

router.get('/count', getCount);
router.get('/authors', getAuthors);
router.get('/:id', getById);

module.exports = router;

function getAuthors(req, res, next) {
    return service
        .getAuthors()
        .then((result) => res.json(result))
        .catch((err) => next(err));
}

function getById(req, res, next) {
    return service
        .getById(req.params.id)
        .then((result) => res.json(result))
        .catch((err) => next(err));
}

function getCount(req, res, next) {
    return service
        .getCount()
        .then((result) => res.json(result))
        .catch((err) => next(err));
}
