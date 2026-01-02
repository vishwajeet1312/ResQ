import express from 'express';
import Triage from '../models/Triage.model.js';

const router = express.Router();

// Generate unique request ID
const generateRequestId = () => {
  const prefix = 'REQ';
  const number = Math.floor(Math.random() * 9000) + 1;
  return `${prefix}-${String(number).padStart(3, '0')}`;
};

// Calculate priority score based on multiple factors
function calculateScore(type, distance, affectedCount = 1) {
  let score = 50; // Base score

  // Type weights
  const typeWeights = {
    'Critical': 40,
    'Rescue': 35,
    'Medical': 30,
    'Power': 20,
    'Resource': 15,
    'Other': 10
  };
  score += typeWeights[type] || 10;

  // Distance penalty (closer = higher score)
  if (distance < 2) score += 20;
  else if (distance < 5) score += 15;
  else if (distance < 10) score += 10;
  else score += 5;

  // Affected count bonus
  score += Math.min(affectedCount * 2, 20);

  return Math.min(Math.max(score, 0), 100);
}

// @route   POST /api/triage
// @desc    Create new triage request
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { type, location, need, affectedCount, notes } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'User';

    // Validation
    if (!type || !need) {
      return res.status(400).json({
        success: false,
        error: 'Type and need are required'
      });
    }

    // Validate type
    const validTypes = ['Critical', 'Rescue', 'Power', 'Resource', 'Medical', 'Other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    const distance = location?.distance || 0;
    const score = calculateScore(type, distance, affectedCount || 1);
    const priority = score > 85 ? 4 : score > 70 ? 3 : score > 50 ? 2 : 1;

    const triage = await Triage.create({
      requestId: generateRequestId(),
      type,
      userId,
      userName,
      location,
      need,
      status: 'CREATED',
      priority,
      score,
      notes,
      estimatedResponseTime: Math.ceil(distance * 5) // rough estimate: 5 min per km
    });

    // Broadcast new triage request
    req.io.emit('new-triage', {
      triageId: triage._id,
      requestId: triage.requestId,
      type: triage.type,
      score: triage.score,
      location: triage.location
    });

    res.status(201).json({
      success: true,
      data: triage
    });
  } catch (error) {
    console.error('Error creating triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/triage
// @desc    Get all triage requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, type, minScore, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (minScore) query.score = { $gte: parseInt(minScore) };

    const triageList = await Triage.find(query)
      .sort({ score: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Triage.countDocuments(query);

    res.json({
      success: true,
      count: triageList.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: triageList
    });
  } catch (error) {
    console.error('Error fetching triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/triage/:id
// @desc    Get single triage request
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const triage = await Triage.findById(req.params.id);

    if (!triage) {
      return res.status(404).json({
        success: false,
        error: 'Triage request not found'
      });
    }

    res.json({
      success: true,
      data: triage
    });
  } catch (error) {
    console.error('Error fetching triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/triage/:id/status
// @desc    Update triage status
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'User';

    const triage = await Triage.findById(req.params.id);

    if (!triage) {
      return res.status(404).json({
        success: false,
        error: 'Triage request not found'
      });
    }

    const oldStatus = triage.status;
    triage.status = status;

    if (notes) {
      triage.updates.push({
        message: notes,
        updatedBy: userId,
        timestamp: new Date()
      });
    }

    if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      const responseTime = Math.round((new Date() - triage.createdAt) / 60000); // minutes
      triage.actualResponseTime = responseTime;
    }

    await triage.save();

    // Broadcast status update
    req.io.emit('triage-status-updated', {
      triageId: triage._id,
      requestId: triage.requestId,
      status,
      updatedBy: userName
    });

    res.json({
      success: true,
      data: triage
    });
  } catch (error) {
    console.error('Error updating triage status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/triage/:id/assign
// @desc    Assign responder to triage
// @access  Private
router.post('/:id/assign', async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'Responder';

    const triage = await Triage.findById(req.params.id);

    if (!triage) {
      return res.status(404).json({
        success: false,
        error: 'Triage request not found'
      });
    }

    // Check if already assigned
    const alreadyAssigned = triage.assignedTo.some(a => a.userId === userId);

    if (!alreadyAssigned) {
      triage.assignedTo.push({
        userId,
        userName,
        role: role || 'Responder',
        assignedAt: new Date()
      });

      if (triage.status === 'CREATED') {
        triage.status = 'ASSIGNED';
      }

      triage.updates.push({
        message: `${userName} assigned as ${role || 'Responder'}`,
        updatedBy: userId,
        timestamp: new Date()
      });

      await triage.save();

      // Notify about assignment
      req.io.emit('triage-assigned', {
        triageId: triage._id,
        requestId: triage.requestId,
        responder: userName,
        role: role || 'Responder'
      });
    }

    res.json({
      success: true,
      data: triage
    });
  } catch (error) {
    console.error('Error assigning triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/triage/priority/high
// @desc    Get high priority triage requests
// @access  Private
router.get('/priority/high', async (req, res) => {
  try {
    const highPriority = await Triage.find({
      score: { $gte: 75 },
      status: { $in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS'] }
    })
    .sort({ score: -1, createdAt: -1 })
    .limit(20);

    res.json({
      success: true,
      count: highPriority.length,
      data: highPriority
    });
  } catch (error) {
    console.error('Error fetching high priority triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/triage/user/:userId
// @desc    Get triage requests for specific user
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const triageList = await Triage.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: triageList.length,
      data: triageList
    });
  } catch (error) {
    console.error('Error fetching user triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/triage/assigned/:userId
// @desc    Get triage requests assigned to specific user
// @access  Private
router.get('/assigned/:userId', async (req, res) => {
  try {
    const assigned = await Triage.find({
      'assignedTo.userId': req.params.userId,
      status: { $nin: ['COMPLETED', 'CANCELLED'] }
    })
    .sort({ score: -1, createdAt: -1 });

    res.json({
      success: true,
      count: assigned.length,
      data: assigned
    });
  } catch (error) {
    console.error('Error fetching assigned triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
