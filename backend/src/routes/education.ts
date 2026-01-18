import { Router } from 'express';
import { getEducations, createEducation, updateEducation, deleteEducation } from '../controllers/educationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All education routes are protected
router.use(authMiddleware);

router.get('/', getEducations);
router.post('/', createEducation);
router.put('/:id', updateEducation);
router.delete('/:id', deleteEducation);

export default router;
