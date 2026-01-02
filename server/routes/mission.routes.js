import express from 'express';
import Mission from '../models/Mission.model.js';

const router = express.Router();

// Generate unique mission ID
const generateMissionId = () => {
  const prefix = 'M';
  const number = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${number}`;
};

// @route   POST /api/missions
// @desc    Create new mission
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { target, description, priority, location, objectives, resources, title } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'User';

    // Validation
    if (!target && !title) {
      return res.status(400).json({
        success: false,
        error: 'Target or title is required'
      });
    }

    const mission = await Mission.create({
      missionId: generateMissionId(),
      target: target || title,
      description,
      priority: priority || 'Medium',
      location: location || {
        type: 'Point',
        coordinates: [0, 0],
        address: 'Location not specified'
      },
      objectives: objectives || [],
      resources: resources || [],
      status: 'Planned',
      createdBy: {
        userId,
        userName
      }
    });

    // Broadcast new mission
    req.io.emit('new-mission', {
      missionId: mission.missionId,
      target: mission.target,
      priority: mission.priority,
      createdBy: userName
    });

    res.status(201).json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/missions
// @desc    Get all missions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, priority, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const missions = await Mission.find(query)
      .populate('resources.resourceId')
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Mission.countDocuments(query);

    res.json({
      success: true,
      count: missions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: missions
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/missions/:id
// @desc    Get single mission
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('resources.resourceId');

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }

    res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Error fetching mission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/missions/:id
// @desc    Update mission
// @access  Private
router.patch('/:id', async (req, res) => {
  try {
    const { status, description, priority, objectives } = req.body;
    const userId = req.auth?.userId || 'demo-user';
    const userName = req.auth?.sessionClaims?.name || 'User';

    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }

    if (status) {
      mission.status = status;
      if (status === 'In Progress' && !mission.startTime) {
        mission.startTime = new Date();
      }
      if (status === 'Resolved' && !mission.endTime) {
        mission.endTime = new Date();
      }
    }
    if (description) mission.description = description;
    if (priority) mission.priority = priority;
    if (objectives) mission.objectives = objectives;

    mission.updates.push({
      message: `Mission updated by ${userName}`,
      updatedBy: userId,
      timestamp: new Date()
    });

    await mission.save();

    // Broadcast update
    req.io.emit('mission-updated', {
      missionId: mission.missionId,
      status: mission.status,
      updatedBy: userName
    });

    res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Error updating mission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/missions/:id/teams
// @desc    Assign team to mission
// @access  Private
router.post('/:id/teams', async (req, res) => {
  try {
    const { teamName, members } = req.body;

    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }

    const teamId = `TEAM-${Date.now()}`;
    mission.teams.push({
      teamId,
      teamName,
      members: members || [],
      status: 'Assigned',
      assignedAt: new Date()
    });

    mission.updates.push({
      message: `Team ${teamName} assigned to mission`,
      updatedBy: req.auth?.userId || 'demo-user',
      timestamp: new Date()
    });

    await mission.save();

    // Notify team members
    req.io.emit('team-assigned', {
      missionId: mission.missionId,
      teamName,
      members
    });

    res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Error assigning team:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/missions/active/all
// @desc    Get all active missions
// @access  Public
router.get('/active/all', async (req, res) => {
  try {
    const activeMissions = await Mission.find({
      status: { $in: ['Planned', 'In Progress', 'En Route'] }
    })
    .populate('resources.resourceId')
    .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      count: activeMissions.length,
      data: activeMissions
    });
  } catch (error) {
    console.error('Error fetching active missions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/missions/:id
// @desc    Cancel/delete mission
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }

    mission.status = 'Cancelled';
    mission.updates.push({
      message: 'Mission cancelled',
      updatedBy: req.auth?.userId || 'demo-user',
      timestamp: new Date()
    });

    await mission.save();

    res.json({
      success: true,
      message: 'Mission cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling mission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
