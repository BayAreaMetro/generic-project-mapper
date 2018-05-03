'use strict';

var express = require('express');
var controller = require('./project.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/', controller.show);
router.post('/map', controller.addMap);
router.post('/', controller.create);

router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;