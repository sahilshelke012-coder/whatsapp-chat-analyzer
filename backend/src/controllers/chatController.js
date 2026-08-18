const { runPythonAnalysis, checkPythonHealth } = require('../services/pythonService');
const { deleteFile } = require('../utils/fileCleanup');
const Analysis = require('../models/Analysis');

/**
 * Handle POST /api/chat/analyze
 * Receives file from Multer, forwards to Python analysis service, deletes temp file, returns JSON.
 */
const analyzeChat = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a valid WhatsApp chat .txt file.'
      });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    let analysisData;
    try {
      analysisData = await runPythonAnalysis(filePath);
    } finally {
      // Ensure uploaded temp file is deleted immediately after analysis
      deleteFile(filePath);
    }

    // Save metadata and calculated results stub to MongoDB (without storing raw text)
    let savedDoc = null;
    try {
      savedDoc = await Analysis.create({
        fileName: originalFileName,
        status: 'completed',
        results: analysisData
      });
    } catch (dbErr) {
      console.warn('MongoDB save skipped or failed:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Chat analysis completed successfully.',
      data: {
        id: savedDoc ? savedDoc._id : null,
        fileName: originalFileName,
        uploadedAt: new Date(),
        ...analysisData
      }
    });

  } catch (error) {
    if (req.file && req.file.path) {
      deleteFile(req.file.path);
    }
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during chat analysis.'
    });
  }
};

/**
 * Check Python service health status
 */
const getPythonServiceStatus = async (req, res, next) => {
  const health = await checkPythonHealth();
  if (health.reachable) {
    return res.status(200).json({
      success: true,
      pythonService: 'REACHABLE',
      details: health.data
    });
  } else {
    return res.status(503).json({
      success: false,
      pythonService: 'UNREACHABLE',
      error: health.error
    });
  }
};

module.exports = {
  analyzeChat,
  getPythonServiceStatus
};
