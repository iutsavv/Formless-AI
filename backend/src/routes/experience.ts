import { Router } from 'express';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../controllers/experienceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All experience routes are protected
router.use(authMiddleware);

router.get('/', getExperiences);
router.post('/', createExperience);
router.put('/:id', updateExperience);
router.delete('/:id', deleteExperience);

export default router;
