import express from 'express';
import Notification from '../models/Notification.model.js';

const router = express.Router();

// @route   POST /api/notifications
// @desc    Create notification
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, severity, actionUrl, metadata, expiresAt } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      severity: severity || 'info',
      actionUrl,
      metadata,
      expiresAt
    });

    // Send real-time notification via Socket.IO
    req.io.to(`user-${userId}`).emit('new-notification', {
      notificationId: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      timestamp: notification.createdAt
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/notifications
// @desc    Get all notifications for authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.auth?.userId || 'demo-user';
    const { read, type, limit = 50, page = 1 } = req.query;
    
    let query = { userId };
    if (read !== undefined) query.read = read === 'true';
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/notifications/unread
// @desc    Get unread notifications count
// @access  Private
router.get('/unread/count', async (req, res) => {
  try {
    const userId = req.auth?.userId || 'demo-user';
    
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Verify ownership
    if (notification.userId !== req.auth.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/notifications/read/all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read/all', async (req, res) => {
  try {
    const userId = req.auth.userId;

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Verify ownership
    if (notification.userId !== req.auth.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/all
// @desc    Delete all notifications for user
// @access  Private
router.delete('/all/user', async (req, res) => {
  try {
    const userId = req.auth.userId;

    await Notification.deleteMany({ userId });

    res.json({
      success: true,
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Utility function to create and broadcast notification
export async function createNotification(io, { userId, type, title, message, severity, actionUrl, metadata }) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      severity: severity || 'info',
      actionUrl,
      metadata
    });

    // Send real-time notification
    io.to(`user-${userId}`).emit('new-notification', {
      notificationId: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      timestamp: notification.createdAt
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export default router;
