import express from 'express';

import { downloadFileById, uploadFile, uploadMultipleFiles } from '../controllers/fileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
router.post('/upload', authenticateToken, uploadFile);
router.post('/uploadMultiple', authenticateToken, uploadMultipleFiles);
router.get('/download/:id', downloadFileById);

export default router;
