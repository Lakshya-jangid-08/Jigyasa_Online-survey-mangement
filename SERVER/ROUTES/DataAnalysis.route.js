const express = require('express');
const {
  uploadCSV,
  generatePlotData,
  groupByColumns,
  saveAnalysis,
  getAnalyses,
  getAnalysis,
  updateAnalysis,
  deleteAnalysis,
  publishAnalysis
} = require('../CONTROLLERS/dataAnalysisController');
const { protect } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

// All routes are protected
router.post('/csv-uploads', protect, uploadCSV);
router.post('/plot-data', protect, generatePlotData);
router.post('/groupby', protect, groupByColumns);

router.post('/analyses', protect, saveAnalysis);
router.get('/analyses', protect, getAnalyses);
router.get('/analyses/:id', protect, getAnalysis);
router.put('/analyses/:id', protect, updateAnalysis);
router.delete('/analyses/:id', protect, deleteAnalysis);
router.post('/publish-analysis', protect, publishAnalysis);

module.exports = router;
