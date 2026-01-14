import { Router } from 'express';
import {
    getUnknownFields,
    getUnknownFieldsForDomain,
    createUnknownFields,
    updateUnknownFieldValue,
    deleteUnknownField,
    bulkUpdateFieldValues,
} from '../controllers/unknownFieldsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', getUnknownFields);
router.get('/domain/:domain', getUnknownFieldsForDomain);
router.post('/', createUnknownFields);
router.put('/bulk', bulkUpdateFieldValues);
router.put('/:id', updateUnknownFieldValue);
router.delete('/:id', deleteUnknownField);

export default router;
