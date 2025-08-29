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
const { parseCsv, generatePlotData2, groupByColumn2, publishAnalysis2, saveAnalysis2 ,getAnalyses2 } = require('../CONTROLLERS/csvController');

const router = express.Router();

// All routes are protected
router.post('/csv-uploads', protect, uploadCSV);
router.post('/csv-parse', protect, parseCsv);
router.post('/plot-data-parse', protect, generatePlotData2)
router.post('/groupby-parse', protect, groupByColumn2);
router.post('/analyses-parse', protect, saveAnalysis2);
router.get('/analyses-parse', protect, getAnalyses2);
router.post('/publish-analysis-parse', protect, publishAnalysis2);

router.post('/plot-data', protect, generatePlotData);
router.post('/groupby', protect, groupByColumns);

router.post('/analyses', protect, saveAnalysis);
router.get('/analyses', protect, getAnalyses);
router.get('/analyses/:id', protect, getAnalysis);
router.put('/analyses/:id', protect, updateAnalysis);
router.delete('/analyses/:id', protect, deleteAnalysis);
router.post('/publish-analysis', protect, publishAnalysis);

module.exports = router;
