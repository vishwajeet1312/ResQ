import express from 'express';
import Incident from '../models/Incident.model.js';

const router = express.Router();

// Generate unique report ID
const generateReportId = () => {
  const prefix = 'REP';
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${number}`;
};

// @route   POST /api/incidents
// @desc    Create new incident report
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { type, location, description, severity, affectedCount, attachments, media } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'Anonymous';

    // Validation
    if (!type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Type and description are required'
      });
    }

    // Handle both 'attachments' and 'media' fields (frontend sends 'media')
    const incidentAttachments = attachments || media || [];

    const incident = await Incident.create({
      reportId: generateReportId(),
      userId,
      userName,
      type,
      location: location || {
        type: 'Point',
        coordinates: [0, 0],
        address: 'Location not specified'
      },
      description,
      severity: severity || 'Medium',
      affectedCount: affectedCount || 0,
      attachments: incidentAttachments,
      status: 'Open'
    });

    // Broadcast new incident
    req.io.emit('new-incident', {
      incidentId: incident._id,
      reportId: incident.reportId,
      type: incident.type,
      severity: incident.severity,
      location: incident.location,
      timestamp: incident.createdAt
    });

    res.status(201).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/incidents
// @desc    Get all incidents
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, severity, type, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Incident.countDocuments(query);

    res.json({
      success: true,
      count: incidents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: incidents
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/incidents/:id
// @desc    Get single incident
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/incidents/:id
// @desc    Update incident
// @access  Private
router.patch('/:id', async (req, res) => {
  try {
    const { status, severity, description, affectedCount } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'User';

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }

    if (status) incident.status = status;
    if (severity) incident.severity = severity;
    if (description) incident.description = description;
    if (affectedCount !== undefined) incident.affectedCount = affectedCount;

    incident.updates.push({
      message: `Incident updated by ${userName}`,
      updatedBy: userId,
      timestamp: new Date()
    });

    await incident.save();

    // Broadcast update
    req.io.emit('incident-updated', {
      incidentId: incident._id,
      reportId: incident.reportId,
      status: incident.status,
      updatedBy: userName
    });

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/incidents/:id/assign
// @desc    Assign responder to incident
// @access  Private
router.post('/:id/assign', async (req, res) => {
  try {
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'Responder';

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }

    // Check if already assigned
    const alreadyAssigned = incident.responders.some(r => r.userId === userId);

    if (!alreadyAssigned) {
      incident.responders.push({
        userId,
        userName,
        assignedAt: new Date()
      });

      if (incident.status === 'Open') {
        incident.status = 'In Progress';
      }

      incident.updates.push({
        message: `${userName} assigned to incident`,
        updatedBy: userId,
        timestamp: new Date()
      });

      await incident.save();

      // Notify about assignment
      req.io.emit('incident-assigned', {
        incidentId: incident._id,
        reportId: incident.reportId,
        responder: userName
      });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error assigning incident:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/incidents/nearby/:lng/:lat
// @desc    Get nearby incidents
// @access  Private
router.get('/nearby/:lng/:lat', async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const { maxDistance = 10000, limit = 20 } = req.query; // default 10km

    const nearbyIncidents = await Incident.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: { status: { $in: ['Open', 'In Progress'] } }
        }
      },
      { $limit: parseInt(limit) },
      { $sort: { distance: 1, severity: -1 } }
    ]);

    res.json({
      success: true,
      count: nearbyIncidents.length,
      data: nearbyIncidents
    });
  } catch (error) {
    console.error('Error fetching nearby incidents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
