import { Router } from 'express';
import multer from 'multer';
import { parseResume } from '../controllers/resumeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept PDF, DOC, DOCX, TXT
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.'));
        }
    },
});

// All routes are protected
router.use(authMiddleware);

router.post('/parse', upload.single('resume'), parseResume);

export default router;
