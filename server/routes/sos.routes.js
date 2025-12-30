import express from 'express';
import SOS from '../models/SOS.model.js';
import Notification from '../models/Notification.model.js';
import { requireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// @route   POST /api/sos
// @desc    Broadcast emergency SOS
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { coordinates, address, sector, description, severity } = req.body;
    const userId = req.auth.userId;
    const userName = req.auth.sessionClaims?.name || 'Anonymous User';

    // Create SOS
    const sos = await SOS.create({
      userId,
      userName,
      location: {
        type: 'Point',
        coordinates,
        address,
        sector
      },
      description,
      severity: severity || 'High',
      status: 'BROADCASTING'
    });

    // Find nearby responders (within 10km)
    const nearbyResponders = await SOS.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates },
          distanceField: 'distance',
          maxDistance: 10000, // 10km in meters
          spherical: true
        }
      },
      { $limit: 50 }
    ]);

    sos.respondersNearby = nearbyResponders.length;
    await sos.save();

    // Broadcast via Socket.IO
    req.io.emit('sos-broadcast', {
      sosId: sos._id,
      userName,
      location: sos.location,
      severity: sos.severity,
      respondersNearby: sos.respondersNearby,
      timestamp: sos.createdAt
    });

    // Create notifications for nearby responders
    // In production, you'd query actual users within radius
    req.io.to(`sector-${sector}`).emit('new-sos', {
      sosId: sos._id,
      message: `New ${severity} SOS from ${userName}`,
      location: sos.location
    });

    res.status(201).json({
      success: true,
      data: sos
    });
  } catch (error) {
    console.error('Error creating SOS:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/sos
// @desc    Get all SOS signals
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, severity, limit = 50, sector } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (sector) query['location.sector'] = sector;

    const sosList = await SOS.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: sosList.length,
      data: sosList
    });
  } catch (error) {
    console.error('Error fetching SOS:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/sos/:id
// @desc    Get single SOS by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        error: 'SOS not found'
      });
    }

    res.json({
      success: true,
      data: sos
    });
  } catch (error) {
    console.error('Error fetching SOS:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/sos/:id/acknowledge
// @desc    Acknowledge SOS
// @access  Private
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userName = req.auth.sessionClaims?.name || 'Responder';

    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        error: 'SOS not found'
      });
    }

    // Check if already acknowledged by this user
    const alreadyAcknowledged = sos.acknowledgedBy.some(
      ack => ack.userId === userId
    );

    if (!alreadyAcknowledged) {
      sos.acknowledgedBy.push({
        userId,
        userName,
        timestamp: new Date()
      });
      sos.status = 'ACKNOWLEDGED';
      await sos.save();

      // Notify SOS creator
      req.io.emit('sos-acknowledged', {
        sosId: sos._id,
        responder: userName,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: sos
    });
  } catch (error) {
    console.error('Error acknowledging SOS:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/sos/:id/status
// @desc    Update SOS status
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.auth.userId;
    const userName = req.auth.sessionClaims?.name || 'User';

    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        error: 'SOS not found'
      });
    }

    sos.status = status;

    if (status === 'RESOLVED') {
      sos.resolvedBy = {
        userId,
        userName,
        timestamp: new Date()
      };
    }

    await sos.save();

    // Broadcast status update
    req.io.emit('sos-status-updated', {
      sosId: sos._id,
      status,
      updatedBy: userName,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: sos
    });
  } catch (error) {
    console.error('Error updating SOS status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/sos/nearby/:lng/:lat
// @desc    Get nearby SOS signals
// @access  Private
router.get('/nearby/:lng/:lat', async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const { maxDistance = 5000, limit = 20 } = req.query; // default 5km

    const nearbySOS = await SOS.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: { status: { $in: ['BROADCASTING', 'ACKNOWLEDGED'] } }
        }
      },
      { $limit: parseInt(limit) },
      { $sort: { distance: 1, createdAt: -1 } }
    ]);

    res.json({
      success: true,
      count: nearbySOS.length,
      data: nearbySOS
    });
  } catch (error) {
    console.error('Error fetching nearby SOS:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
