import { Router } from 'express';
import { register, registerAdmin, login, logout } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post('/logout', logout);

export default router;
