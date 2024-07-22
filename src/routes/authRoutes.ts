import express from 'express';
import { loginUser } from '../controllers/authController';
import { registerUser } from '../controllers/userController';

const router = express.Router();

// Route to login and get a JWT token
router.post('/login', loginUser);
router.post('/register', registerUser);

export default router;
