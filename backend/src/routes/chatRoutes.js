const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeChat, getPythonServiceStatus } = require('../controllers/chatController');

// POST /api/chat/analyze - Upload and analyze WhatsApp chat file
router.post('/analyze', upload.single('chatFile'), analyzeChat);

// GET /api/chat/python-health - Verify python microservice reachability
router.get('/python-health', getPythonServiceStatus);

module.exports = router;
