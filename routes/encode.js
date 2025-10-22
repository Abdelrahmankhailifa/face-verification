const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const encodeController = require('../controllers/encodeController'); // CHANGED: removed "-simple"

router.post('/', upload.single('image'), handleMulterError, encodeController.encodeFace);

module.exports = router;