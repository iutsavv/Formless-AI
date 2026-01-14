import { Router } from 'express';
import { getProfile, updateProfile, getProfileForFill } from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All profile routes are protected
router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/fill', getProfileForFill);

export default router;
