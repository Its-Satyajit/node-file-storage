import express from 'express';
import { getUsers, getUserFilesStats, updateUserAccess } from '../controllers/adminDashboardController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authMiddleware';
import { UserRole } from '../types/roles';
const router = express.Router();

router.get('/users', authenticateToken, authorizeRole(UserRole.ADMIN), getUsers);
router.get('/user/:userId/files', authenticateToken, authorizeRole(UserRole.ADMIN), getUserFilesStats);
router.patch('/user/:userId/access', authenticateToken, authorizeRole(UserRole.ADMIN), updateUserAccess);
export default router;
