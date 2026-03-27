const Organization = require('../MODELS/organizationModel');
const asyncHandler = require('express-async-handler');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
const getOrganizations = asyncHandler(async (req, res) => {
  try {
    // Add timeout to prevent buffering timeout
    const organizations = await Organization.find().maxTimeMS(5000).lean();
    
    // Map to format expected by frontend (with id property instead of _id)
    const formattedOrganizations = organizations.map(org => ({
      id: org._id,
      _id: org._id, // Keep _id also for compatibility
      name: org.name,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
    
    res.status(200).json(formattedOrganizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    
    // Handle timeout errors specifically
    if (error.message.includes('timed out')) {
      return res.status(504).json({ 
        message: 'Database query timed out. Please try again.',
        error: 'Query timeout'
      });
    }
    
    res.status(500).json({ message: 'Failed to fetch organizations', error: error.message });
  }
});

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Public
const getOrganization = asyncHandler(async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).maxTimeMS(5000).lean();
    
    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }
    
    res.status(200).json(organization);
  } catch (error) {
    if (error.message.includes('timed out')) {
      return res.status(504).json({ message: 'Database query timed out', error: 'Query timeout' });
    }
    throw error;
  }
});

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private/Admin
const createOrganization = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if organization with same name exists
    const existingOrganization = await Organization.findOne({ name }).maxTimeMS(5000);
    if (existingOrganization) {
      res.status(400);
      throw new Error('Organization with this name already exists');
    }
    
    const organization = await Organization.create({
      name
    });
    
    res.status(201).json(organization);
  } catch (error) {
    if (error.message.includes('timed out')) {
      return res.status(504).json({ message: 'Database operation timed out', error: 'Operation timeout' });
    }
    throw error;
  }
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Admin
const updateOrganization = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    
    let organization = await Organization.findById(req.params.id).maxTimeMS(5000);
    
    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }
    
    // Check if another organization with the same name exists
    if (name && name !== organization.name) {
      const existingOrganization = await Organization.findOne({ name }).maxTimeMS(5000);
      if (existingOrganization) {
        res.status(400);
        throw new Error('Organization with this name already exists');
      }
    }
    
    organization.name = name || organization.name;
    organization.updatedAt = Date.now();
    
    await organization.save();
    
    res.status(200).json(organization);
  } catch (error) {
    if (error.message.includes('timed out')) {
      return res.status(504).json({ message: 'Database operation timed out', error: 'Operation timeout' });
    }
    throw error;
  }
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/Admin
const deleteOrganization = asyncHandler(async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).maxTimeMS(5000);
    
    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }
    
    await organization.deleteOne();
    
    res.status(200).json({ success: true, message: 'Organization removed' });
  } catch (error) {
    if (error.message.includes('timed out')) {
      return res.status(504).json({ message: 'Database operation timed out', error: 'Operation timeout' });
    }
    throw error;
  }
});

module.exports = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
};
