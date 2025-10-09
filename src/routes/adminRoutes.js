const express = require('express');
const router = express.Router();
const { 
  getAllUsersHandler,
  getUserById,
  updateUserHandler,
  getDeviceStatus,
  getNotificationsForUser,
  deleteUserHandler,
  createUserHandler
} = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Admin routes (all require authentication and admin role)
router.get('/users', authenticate, authorizeAdmin, getAllUsersHandler);
router.post('/users', authenticate, authorizeAdmin, createUserHandler);
router.get('/users/:id', authenticate, authorizeAdmin, getUserById);
router.put('/users/:id', authenticate, authorizeAdmin, updateUserHandler);
router.delete('/users/:id', authenticate, authorizeAdmin, deleteUserHandler);
router.get('/devices', authenticate, authorizeAdmin, getDeviceStatus);
router.get('/notifications/:deviceId', authenticate, authorizeAdmin, getNotificationsForUser);

module.exports = router;
