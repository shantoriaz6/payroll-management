import { Router } from 'express';
import { loginAdmin, logoutAdmin, refreshAccessToken } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewear/auth.middlewear.js';

const router = Router();

router.post('/login', loginAdmin);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', verifyJWT, logoutAdmin);

export default router;
