import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const educationSchema = z.object({
    degree: z.string().min(1, 'Degree is required'),
    fieldOfStudy: z.string().optional().nullable(),
    institution: z.string().min(1, 'Institution is required'),
    location: z.string().optional().nullable(),
    gpa: z.string().optional().nullable(),
    startMonth: z.string().optional().nullable(),
    startYear: z.string().optional().nullable(),
    endMonth: z.string().optional().nullable(),
    endYear: z.string().optional().nullable(),
    isCurrent: z.boolean().optional().default(false),
});

// Get all education entries for the user
export async function getEducations(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: { educations: { orderBy: { endYear: 'desc' } } },
        });

        if (!profile) {
            res.json({ educations: [] });
            return;
        }

        res.json({ educations: profile.educations });
    } catch (error) {
        console.error('Get educations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create a new education entry
export async function createEducation(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const validation = educationSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        // Get or create profile
        let profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
            profile = await prisma.profile.create({ data: { userId } });
        }

        const education = await prisma.education.create({
            data: {
                profileId: profile.id,
                ...validation.data,
            },
        });

        res.status(201).json({ message: 'Education created successfully', education });
    } catch (error) {
        console.error('Create education error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update an existing education entry
export async function updateEducation(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const validation = educationSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        // Verify ownership
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }

        const existing = await prisma.education.findFirst({
            where: { id, profileId: profile.id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Education not found' });
            return;
        }

        const education = await prisma.education.update({
            where: { id },
            data: validation.data,
        });

        res.json({ message: 'Education updated successfully', education });
    } catch (error) {
        console.error('Update education error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete an education entry
export async function deleteEducation(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Verify ownership
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }

        const existing = await prisma.education.findFirst({
            where: { id, profileId: profile.id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Education not found' });
            return;
        }

        await prisma.education.delete({ where: { id } });

        res.json({ message: 'Education deleted successfully' });
    } catch (error) {
        console.error('Delete education error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
