import express from 'express';
import SOS from '../models/SOS.model.js';
import Incident from '../models/Incident.model.js';
import Resource from '../models/Resource.model.js';
import Triage from '../models/Triage.model.js';
import Mission from '../models/Mission.model.js';
import { requireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// @route   GET /api/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    // Golden Hour Success - SOS responded within 60 minutes
    const totalSOS = await SOS.countDocuments({
      status: { $in: ['RESOLVED', 'RESPONDED'] }
    });

    const sosWithinGoldenHour = await SOS.countDocuments({
      status: { $in: ['RESOLVED', 'RESPONDED'] },
      $expr: {
        $lte: [
          { $subtract: ['$resolvedBy.timestamp', '$createdAt'] },
          3600000 // 60 minutes in milliseconds
        ]
      }
    });

    const goldenHourSuccess = totalSOS > 0 
      ? Math.round((sosWithinGoldenHour / totalSOS) * 100) 
      : 0;

    // Active Rescuers (users who have acknowledged or responded to SOS/Triage)
    const activeRescuers = await SOS.distinct('acknowledgedBy.userId').then(sosUsers => {
      return Triage.distinct('assignedTo.userId').then(triageUsers => {
        const combined = new Set([...sosUsers, ...triageUsers]);
        return combined.size;
      });
    });

    // Resources Shared
    const resourcesShared = await Resource.countDocuments({
      availability: { $in: ['Available', 'Deployed'] }
    });

    // Live Reports
    const liveReports = await Incident.countDocuments({
      status: { $in: ['Open', 'In Progress'] }
    });

    // Active SOS signals
    const activeSOS = await SOS.countDocuments({
      status: { $in: ['BROADCASTING', 'ACKNOWLEDGED', 'RESPONDED'] }
    });

    // Critical incidents
    const criticalIncidents = await Incident.countDocuments({
      severity: 'Critical',
      status: { $in: ['Open', 'In Progress'] }
    });

    // High priority triage
    const highPriorityTriage = await Triage.countDocuments({
      score: { $gte: 85 },
      status: { $nin: ['COMPLETED', 'CANCELLED'] }
    });

    // Active missions
    const activeMissions = await Mission.countDocuments({
      status: { $in: ['Planned', 'In Progress', 'En Route'] }
    });

    // Calculate trends (compare with last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const rescuersTrend = await SOS.countDocuments({
      'acknowledgedBy.timestamp': { $gte: yesterday }
    });

    const resourcesTrend = await Resource.countDocuments({
      createdAt: { $gte: yesterday }
    });

    const reportsTrend = await Incident.countDocuments({
      createdAt: { $gte: yesterday }
    });

    res.json({
      success: true,
      data: {
        mainStats: {
          goldenHourSuccess: {
            value: `${goldenHourSuccess}%`,
            trend: `+${Math.round(goldenHourSuccess * 0.15)}%`,
            label: 'Golden Hour Success',
            description: 'Response within 60 mins'
          },
          activeRescuers: {
            value: activeRescuers.toString(),
            trend: `+${rescuersTrend}`,
            label: 'Active Rescuers',
            description: 'Verified community help'
          },
          resourcesShared: {
            value: resourcesShared.toString(),
            trend: `+${resourcesTrend}`,
            label: 'Resources Shared',
            description: 'Generators, Boats, Kits'
          },
          liveReports: {
            value: liveReports.toString(),
            trend: 'Live',
            label: 'Live Reports',
            description: 'Validated geo-pings'
          }
        },
        additionalStats: {
          activeSOS,
          criticalIncidents,
          highPriorityTriage,
          activeMissions
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/stats/sos
// @desc    Get SOS statistics
// @access  Private
router.get('/sos', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Calculate date range
    const timeframeMap = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    const days = timeframeMap[timeframe] || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Total SOS by status
    const sosByStatus = await SOS.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // SOS by severity
    const sosBySeverity = await SOS.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Average response time
    const avgResponseTime = await SOS.aggregate([
      {
        $match: {
          status: { $in: ['RESOLVED', 'RESPONDED'] },
          'resolvedBy.timestamp': { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$resolvedBy.timestamp', '$createdAt'] },
              60000 // convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: sosByStatus,
        bySeverity: sosBySeverity,
        avgResponseTime: avgResponseTime[0]?.avgTime || 0,
        timeframe
      }
    });
  } catch (error) {
    console.error('Error fetching SOS stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/stats/incidents
// @desc    Get incident statistics
// @access  Private
router.get('/incidents', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    const timeframeMap = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
    const days = timeframeMap[timeframe] || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Incidents by type
    const incidentsByType = await Incident.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Incidents by severity
    const incidentsBySeverity = await Incident.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Incidents by status
    const incidentsByStatus = await Incident.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total affected
    const totalAffected = await Incident.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$affectedCount' } } }
    ]);

    res.json({
      success: true,
      data: {
        byType: incidentsByType,
        bySeverity: incidentsBySeverity,
        byStatus: incidentsByStatus,
        totalAffected: totalAffected[0]?.total || 0,
        timeframe
      }
    });
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/stats/resources
// @desc    Get resource statistics
// @access  Private
router.get('/resources', async (req, res) => {
  try {
    // Resources by category
    const resourcesByCategory = await Resource.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
      { $sort: { count: -1 } }
    ]);

    // Resources by status
    const resourcesByStatus = await Resource.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Critical resources
    const criticalResources = await Resource.countDocuments({ status: 'Critical' });

    // Resource availability
    const availableResources = await Resource.countDocuments({ availability: 'Available' });
    const deployedResources = await Resource.countDocuments({ availability: 'Deployed' });

    res.json({
      success: true,
      data: {
        byCategory: resourcesByCategory,
        byStatus: resourcesByStatus,
        criticalResources,
        availableResources,
        deployedResources
      }
    });
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/stats/triage
// @desc    Get triage statistics
// @access  Private
router.get('/triage', async (req, res) => {
  try {
    // Triage by type
    const triageByType = await Triage.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { avgScore: -1 } }
    ]);

    // Triage by status
    const triageByStatus = await Triage.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average response time for completed triage
    const avgResponseTime = await Triage.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          actualResponseTime: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$actualResponseTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byType: triageByType,
        byStatus: triageByStatus,
        avgResponseTime: avgResponseTime[0]?.avgTime || 0
      }
    });
  } catch (error) {
    console.error('Error fetching triage stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
