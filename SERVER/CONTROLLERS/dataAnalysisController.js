const { CSVUpload, Analysis } = require('../MODELS/dataAnalysisModels');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = `${uuidv4()}-${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
}).single('file');

// @desc    Upload CSV file
// @route   POST /api/data-analysis/csv-uploads
// @access  Private
const uploadCSV = asyncHandler(async (req, res) => {
  // Handle file upload
  upload(req, res, async function(err) {
    if (err) {
      res.status(400);
      throw new Error(err.message);
    }
    
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a CSV file');
    }
    
    // Parse CSV to get columns
    const columns = await getCSVColumns(req.file.path);
    
    // Save CSV upload record
    const csvUpload = await CSVUpload.create({
      user: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      columns
    });
    
    res.status(201).json({
      id: csvUpload._id,
      columns
    });
  });
});

// Helper function to get columns from CSV
const getCSVColumns = (filePath) => {
  return new Promise((resolve, reject) => {
    let columns = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        columns = headers;
      })
      .on('data', () => {
        // Do nothing with data, we just need headers
      })
      .on('end', () => {
        resolve(columns);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// @desc    Generate plot data
// @route   POST /api/data-analysis/plot-data
// @access  Private
const generatePlotData = asyncHandler(async (req, res) => {
  const { plot_type, x_axis, y_axes, csv_upload_id } = req.body;
  
  // Validate request
  if (!plot_type || !csv_upload_id) {
    res.status(400);
    throw new Error('Plot type and CSV upload ID are required');
  }
  
  // Check plot type requirements
  if (['scatter', 'bar', 'line', 'pie', 'area'].includes(plot_type) && (!x_axis || !y_axes || !y_axes.length)) {
    res.status(400);
    throw new Error('X-axis and at least one Y-axis are required for this plot type');
  } else if (['heatmap'].includes(plot_type) && (!x_axis || !y_axes || y_axes.length < 1)) {
    res.status(400);
    throw new Error('X-axis and at least one Y-axis are required for heatmap');
  } else if (['box'].includes(plot_type) && (!y_axes || !y_axes.length)) {
    res.status(400);
    throw new Error('At least one Y-axis is required for box plot');
  }
  
  // Find CSV upload
  const csvUpload = await CSVUpload.findById(csv_upload_id);
  if (!csvUpload) {
    res.status(404);
    throw new Error('CSV upload not found');
  }
  
  // Check if user owns the CSV upload
  if (csvUpload.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this CSV upload');
  }
  
  try {
    // Parse CSV and generate plot data
    const data = await generatePlotDataFromCSV(csvUpload.filePath, plot_type, x_axis, y_axes);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({
        message: 'Failed to generate plot data',
        error: 'The CSV may not contain appropriate data for the selected plot type and axes'
      });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating plot data:', error);
    res.status(500).json({ 
      message: 'Failed to generate plot data', 
      error: error.message 
    });
  }
});

// Helper function to generate plot data from CSV
const generatePlotDataFromCSV = async (filePath, plotType, xAxis, yAxes) => {
  // Validate inputs
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Invalid CSV file path');
  }
  
  if (!plotType) {
    throw new Error('Plot type is required');
  }
  
  // For most plot types, we need both x and y axes
  if (['scatter', 'line', 'bar', 'pie'].includes(plotType)) {
    if (!xAxis) {
      throw new Error(`X-axis is required for ${plotType} plots`);
    }
    
    if (!yAxes || !Array.isArray(yAxes) || yAxes.length === 0) {
      throw new Error(`At least one Y-axis is required for ${plotType} plots`);
    }
  }
  return new Promise((resolve, reject) => {
    const data = [];
    const xValues = [];
    const yValuesMap = {};
    
    // Initialize y-axes maps
    yAxes.forEach(y => {
      yValuesMap[y] = [];
    });
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Store x and y values
        if (xAxis) {
          xValues.push(row[xAxis]);
        }
        
        yAxes.forEach(y => {
          yValuesMap[y].push(Number(row[y]) || 0);
        });
      })
      .on('end', () => {
        // Generate appropriate plot data based on plot type
        switch (plotType) {
          case 'scatter':
          case 'line':
            yAxes.forEach(y => {
              data.push({
                type: plotType,
                name: y,
                x: xValues,
                y: yValuesMap[y],
                mode: plotType === 'line' ? 'lines+markers' : 'markers'
              });
            });
            break;
            
          case 'bar':
            yAxes.forEach(y => {
              data.push({
                type: 'bar',
                name: y,
                x: xValues,
                y: yValuesMap[y],
                marker: {
                  color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`
                }
              });
            });
            break;
            
          case 'pie':
            data.push({
              type: 'pie',
              labels: xValues,
              values: yAxes.length > 0 ? yValuesMap[yAxes[0]] : xValues.map(() => 1),
              marker: {
                colors: xValues.map((_, i) => 
                  `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`
                )
              }
            });
            break;
            
          case 'histogram':
            yAxes.forEach(y => {
              data.push({
                type: 'histogram',
                name: y,
                x: yValuesMap[y],
                marker: {
                  color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`
                }
              });
            });
            break;
            break;
            
          case 'heatmap':
            // For simplicity, create a basic heatmap
            data.push({
              type: 'heatmap',
              z: [yValuesMap[yAxes[0]]],
              x: xValues,
              y: [yAxes[0]]
            });
            break;
            
          case 'box':
            yAxes.forEach(y => {
              data.push({
                type: 'box',
                name: y,
                y: yValuesMap[y]
              });
            });
            break;
            
          case 'area':
            yAxes.forEach(y => {
              data.push({
                type: 'scatter',
                fill: 'tozeroy',
                name: y,
                x: xValues,
                y: yValuesMap[y]
              });
            });
            break;
        }
        
        // Create layout
        const layout = {
          title: `${plotType.charAt(0).toUpperCase() + plotType.slice(1)} Plot`,
          xaxis: { title: xAxis },
          yaxis: { title: yAxes.join(', ') }
        };
        
        resolve({ data, layout });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// @desc    Group data by columns
// @route   POST /api/data-analysis/groupby
// @access  Private
const groupByColumns = asyncHandler(async (req, res) => {
  const { columns, csv_upload_id } = req.body;
  
  if (!columns || !columns.length || !csv_upload_id) {
    res.status(400);
    throw new Error('Columns and CSV upload ID are required');
  }
  
  // Find CSV upload
  const csvUpload = await CSVUpload.findById(csv_upload_id);
  if (!csvUpload) {
    res.status(404);
    throw new Error('CSV upload not found');
  }
  
  // Check if user owns the CSV upload
  if (csvUpload.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this CSV upload');
  }
  
  // Group data
  const groupedData = await groupDataByColumns(csvUpload.filePath, columns);
  
  res.status(200).json(groupedData);
});

// Helper function to group data by columns
const groupDataByColumns = async (filePath, columns) => {
  return new Promise((resolve, reject) => {
    const groups = {};
    
    columns.forEach(col => {
      groups[col] = {};
    });
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        columns.forEach(col => {
          const value = row[col];
          
          if (!groups[col][value]) {
            groups[col][value] = 0;
          }
          
          groups[col][value]++;
        });
      })
      .on('end', () => {
        // Convert to array format
        const result = {};
        
        columns.forEach(col => {
          result[col] = Object.entries(groups[col]).map(([value, count]) => ({
            [col]: value,
            count
          }));
        });
        
        resolve(result);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// @desc    Save analysis
// @route   POST /api/data-analysis/analyses
// @access  Private
const saveAnalysis = asyncHandler(async (req, res) => {
  try {
    const { title, author_name, description, plots } = req.body;
    
    // Validate plots array
    if (!plots || !Array.isArray(plots)) {
      return res.status(400).json({
        message: 'Plots must be an array',
        error: 'INVALID_PLOTS_FORMAT'
      });
    }
    
    // Transform and validate each plot
    const validatedPlots = plots.map((plot, index) => {
      // Check for required fields
      if (!plot.type) {
        throw new Error(`Plot #${index + 1} is missing required field: type`);
      }
      
      // For data field, ensure it's present and has proper structure
      if (!plot.data || (Array.isArray(plot.data) && plot.data.length === 0)) {
        throw new Error(`Plot #${index + 1} is missing required field: data`);
      }
      
      // Ensure each plot has all required fields
      return {
        title: plot.title || 'Untitled Plot',
        type: plot.type,
        configuration: plot.configuration || {
          xAxis: plot.xAxis || '',
          yAxes: plot.yAxes || []
        },
        data: plot.data
      };
    });
    
    console.log('Creating analysis with plots:', validatedPlots);
    
    // Create analysis
    const analysis = await Analysis.create({
      user: req.user.id,
      title: title || 'Untitled Analysis',
      authorName: author_name || req.user.username || 'Unknown Author',
      description: description || '',
      plots: validatedPlots
    });
    
    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error saving analysis:', error);
    
    // Handle different types of errors
    if (error.message && (error.message.includes('missing required field') || error.message.includes('validation failed'))) {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
      });
    }
    
    // Handle MongoDB validation errors (from mongoose)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        error: validationErrors.join(', ')
      });
    }
    
    // Handle MongoDB unique constraint errors
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate data error',
        error: `A record with this information already exists.`
      });
    }
    
    // Default server error
    res.status(500).json({ 
      message: 'Failed to save analysis', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get all analyses for user
// @route   GET /api/data-analysis/analyses
// @access  Private
const getAnalyses = asyncHandler(async (req, res) => {
  const analyses = await Analysis.find({ user: req.user.id });
  res.status(200).json(analyses);
});

// @desc    Get single analysis
// @route   GET /api/data-analysis/analyses/:id
// @access  Private
const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id);
  
  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }
  
  // Check if user owns the analysis
  if (analysis.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this analysis');
  }
  
  res.status(200).json(analysis);
});

// @desc    Update analysis
// @route   PUT /api/data-analysis/analyses/:id
// @access  Private
const updateAnalysis = asyncHandler(async (req, res) => {
  try {
    const { title, author_name, description, plots } = req.body;
    
    let analysis = await Analysis.findById(req.params.id);
    
    if (!analysis) {
      res.status(404);
      throw new Error('Analysis not found');
    }
    
    // Check if user owns the analysis
    if (analysis.user.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to update this analysis');
    }
    
    // Update fields
    analysis.title = title || analysis.title;
    analysis.authorName = author_name || analysis.authorName;
    analysis.description = description !== undefined ? description : analysis.description;
    
    if (plots && Array.isArray(plots)) {
      // Transform and validate each plot
      const validatedPlots = plots.map((plot, index) => {
        // Check for required fields
        if (!plot.type) {
          throw new Error(`Plot #${index + 1} is missing required field: type`);
        }
        
        // For data field, ensure it's present
        if (!plot.data) {
          throw new Error(`Plot #${index + 1} is missing required field: data`);
        }
        
        // Ensure each plot has all required fields
        return {
          title: plot.title || 'Untitled Plot',
          type: plot.type,
          configuration: plot.configuration || {
            xAxis: '',
            yAxes: []
          },
          data: plot.data
        };
      });
      
      // Update plots array
      analysis.plots = validatedPlots;
    }
    
    // Save changes
    analysis = await analysis.save();
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error updating analysis:', error);
    
    // Handle different types of errors
    if (error.message && (error.message.includes('missing required field') || error.message.includes('validation failed'))) {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
      });
    }
    
    // Handle MongoDB validation errors (from mongoose)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        error: validationErrors.join(', ')
      });
    }
    
    // Default server error
    res.status(500).json({ 
      message: 'Failed to update analysis', 
      error: error.message
    });
  }
});

// @desc    Delete analysis
// @route   DELETE /api/data-analysis/analyses/:id
// @access  Private
const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id);
  
  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }
  
  // Check if user owns the analysis
  if (analysis.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this analysis');
  }
  
  await analysis.deleteOne();
  
  res.status(204).end();
});

// @desc    Publish analysis to make it public
// @route   POST /api/data-analysis/publish-analysis
// @access  Private
const publishAnalysis = asyncHandler(async (req, res) => {
  const { analysisId } = req.body;
  
  if (!analysisId) {
    res.status(400);
    throw new Error('Analysis ID is required');
  }
  
  const analysis = await Analysis.findById(analysisId);
  
  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }
  
  // Check if user owns the analysis
  if (analysis.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to publish this analysis');
  }
  
  // Update the isPublic flag
  analysis.isPublic = true;
  await analysis.save();
  
  res.status(200).json({ 
    message: 'Analysis published successfully',
    analysis
  });
});

module.exports = {
  uploadCSV,
  generatePlotData,
  groupByColumns,
  saveAnalysis,
  getAnalyses,
  getAnalysis,
  updateAnalysis,
  deleteAnalysis,
  publishAnalysis
};
