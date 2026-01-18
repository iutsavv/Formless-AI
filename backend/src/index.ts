import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import unknownFieldsRoutes from './routes/unknownFields';
import resumeRoutes from './routes/resume';
import experienceRoutes from './routes/experience';
import educationRoutes from './routes/education';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS - Allow all origins in development for Chrome extension compatibility
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' })); // Large limit for resume uploads


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/unknown-fields', unknownFieldsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
