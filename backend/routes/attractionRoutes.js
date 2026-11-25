const express = require('express');
const { listAttractions, getFilterOptions } = require('../controllers/attractionController');

const router = express.Router();

router.get('/', listAttractions);
// Keep literal routes ABOVE any '/:id' route added by the attraction-details owner
router.get('/filters', getFilterOptions);

module.exports = router;
