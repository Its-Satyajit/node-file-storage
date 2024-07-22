import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { approveUser, denyUser } from '../controllers/adminController';
import { UserRole } from '../types/roles';

const router = express.Router();

router.patch('/approve/:userId', authenticateToken, authorizeRole(UserRole.ADMIN), approveUser);
router.patch('/deny/:userId', authenticateToken, authorizeRole(UserRole.ADMIN), denyUser);

export default router;
