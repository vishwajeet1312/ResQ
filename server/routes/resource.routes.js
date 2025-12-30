import express from 'express';
import Resource from '../models/Resource.model.js';

const router = express.Router();

// @route   POST /api/resources
// @desc    Add new resource
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, category, stock, total, location, specifications } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'User';
    const organization = req.auth?.sessionClaims?.organization || '';

    const resource = await Resource.create({
      name,
      category,
      stock,
      total,
      location,
      owner: {
        userId,
        userName,
        organization
      },
      specifications,
      status: calculateStatus(stock, total),
      lastRestockedAt: new Date()
    });

    // Broadcast new resource
    req.io.emit('resource-added', {
      resourceId: resource._id,
      name: resource.name,
      category: resource.category
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to calculate resource status
function calculateStatus(stock, total) {
  const percentage = (stock / total) * 100;
  if (percentage <= 20) return 'Critical';
  if (percentage <= 40) return 'Low';
  if (percentage <= 80) return 'Stable';
  return 'Active';
}

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, availability, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (availability) query.availability = availability;

    const resources = await Resource.find(query)
      .sort({ status: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      count: resources.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/resources/:id
// @desc    Update resource
// @access  Private
router.patch('/:id', async (req, res) => {
  try {
    const { stock, total, status, availability } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    if (stock !== undefined) resource.stock = stock;
    if (total !== undefined) resource.total = total;
    if (status) resource.status = status;
    if (availability) resource.availability = availability;

    // Recalculate status if stock or total changed
    if (stock !== undefined || total !== undefined) {
      resource.status = calculateStatus(
        stock !== undefined ? stock : resource.stock,
        total !== undefined ? total : resource.total
      );
    }

    await resource.save();

    // Broadcast update
    req.io.emit('resource-updated', {
      resourceId: resource._id,
      name: resource.name,
      stock: resource.stock,
      status: resource.status
    });

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/resources/:id/request
// @desc    Request resource
// @access  Private
router.post('/:id/request', async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'User';

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    if (quantity > resource.stock) {
      return res.status(400).json({
        success: false,
        error: 'Requested quantity exceeds available stock'
      });
    }

    resource.requestedBy.push({
      userId,
      userName,
      quantity,
      requestedAt: new Date(),
      status: 'Pending'
    });

    await resource.save();

    // Notify resource owner
    req.io.emit('resource-requested', {
      resourceId: resource._id,
      resourceName: resource.name,
      requester: userName,
      quantity
    });

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error requesting resource:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/resources/:id/request/:requestIndex
// @desc    Approve/reject resource request
// @access  Private
router.patch('/:id/request/:requestIndex', async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const { id, requestIndex } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    const request = resource.requestedBy[parseInt(requestIndex)];
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    request.status = status;

    if (status === 'Approved') {
      resource.stock -= request.quantity;
      resource.status = calculateStatus(resource.stock, resource.total);
    }

    await resource.save();

    // Notify requester
    req.io.emit('resource-request-updated', {
      resourceId: resource._id,
      requesterId: request.userId,
      status
    });

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error updating resource request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/resources/:id/restock
// @desc    Restock resource
// @access  Private
router.post('/:id/restock', async (req, res) => {
  try {
    const { quantity } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    resource.stock = Math.min(resource.stock + quantity, resource.total);
    resource.status = calculateStatus(resource.stock, resource.total);
    resource.lastRestockedAt = new Date();

    await resource.save();

    // Broadcast restock
    req.io.emit('resource-restocked', {
      resourceId: resource._id,
      name: resource.name,
      newStock: resource.stock,
      status: resource.status
    });

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error restocking resource:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/resources/nearby/:lng/:lat
// @desc    Get nearby resources
// @access  Private
router.get('/nearby/:lng/:lat', async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const { category, maxDistance = 50000, limit = 20 } = req.query; // default 50km

    let query = { availability: 'Available' };
    if (category) query.category = category;

    const nearbyResources = await Resource.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query
        }
      },
      { $limit: parseInt(limit) },
      { $sort: { distance: 1 } }
    ]);

    res.json({
      success: true,
      count: nearbyResources.length,
      data: nearbyResources
    });
  } catch (error) {
    console.error('Error fetching nearby resources:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/resources/category/:category
// @desc    Get resources by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const resources = await Resource.find({ category: req.params.category })
      .sort({ status: 1, stock: -1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources by category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Only owner can delete
    if (resource.owner.userId !== req.auth?.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this resource'
      });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
