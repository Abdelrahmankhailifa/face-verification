const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const compareController = require('../controllers/compareController'); // CHANGED: removed "-simple"

router.post('/', upload.single('image'), handleMulterError, compareController.compareFaces);

module.exports = router;