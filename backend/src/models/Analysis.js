const mongoose = require('mongoose');

// Basic model structure for future chat analysis results
const AnalysisSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    // Schema structure for future parsed analytics metrics
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', AnalysisSchema);

