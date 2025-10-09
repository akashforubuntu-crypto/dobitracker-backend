const { 
  findUserById,
  findUserByEmail,
  findUserByDeviceId,
  getAllUsers: getAllUsersFromModel,
  updateUser,
  deleteUser,
  createUser
} = require('../models/userModel');
const { 
  getAllNotificationsByDeviceId,
  getAllNotificationsByDeviceIdPaginated,
  getNotificationCountByDeviceId,
  getNotificationsByDeviceIdAndAppPaginated,
  getNotificationCountByDeviceIdAndApp
} = require('../models/notificationModel');

const getAllUsersHandler = async (req, res) => {
  try {
    console.log('Fetching all users from database...');
    const users = await getAllUsersFromModel();
    res.status(200).json({
      message: 'Users fetched successfully',
      users: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Find user
    const user = await findUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User fetched successfully',
      user: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Validate input
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }
    
    console.log(`Updating user ${id} with data:`, { name, email, role });
    
    const updatedUser = await updateUser(id, { name, email, role });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getNotificationsForUser = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { app, page = 1, limit = 25 } = req.query;
    
    // Validate input
    if (!deviceId) {
      return res.status(400).json({ message: 'Device ID is required' });
    }
    
    console.log(`Fetching notifications for device: ${deviceId}, app: ${app}, page: ${page}, limit: ${limit}`);
    
    let notifications;
    let totalCount;
    
    if (app) {
      // Get notifications for specific app with pagination
      const offset = (page - 1) * limit;
      notifications = await getNotificationsByDeviceIdAndAppPaginated(deviceId, app, limit, offset);
      totalCount = await getNotificationCountByDeviceIdAndApp(deviceId, app);
    } else {
      // Get all notifications for device with pagination
      const offset = (page - 1) * limit;
      notifications = await getAllNotificationsByDeviceIdPaginated(deviceId, limit, offset);
      totalCount = await getNotificationCountByDeviceId(deviceId);
    }
    
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      message: 'Notifications fetched successfully',
      notifications: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalCount: totalCount,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get notifications for user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log(`Deleting user ${id} from database...`);
    
    const deletedUser = await deleteUser(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createUserHandler = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    console.log(`Creating new user:`, { name, email, role });
    
    const newUser = await createUser({ name, email, password, role });
    
    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = {
  getAllUsersHandler,
  getUserById,
  updateUserHandler,
  getNotificationsForUser,
  deleteUserHandler,
  createUserHandler
};
