import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const experienceSchema = z.object({
    jobTitle: z.string().min(1, 'Job title is required'),
    companyName: z.string().min(1, 'Company name is required'),
    location: z.string().optional().nullable(),
    startMonth: z.string().optional().nullable(),
    startYear: z.string().min(1, 'Start year is required'),
    endMonth: z.string().optional().nullable(),
    endYear: z.string().optional().nullable(),
    isCurrent: z.boolean().optional().default(false),
    description: z.string().optional().nullable(),
});

// Get all experiences for the user
export async function getExperiences(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get profile first
        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: { experiences: { orderBy: { startYear: 'desc' } } },
        });

        if (!profile) {
            res.json({ experiences: [] });
            return;
        }

        res.json({ experiences: profile.experiences });
    } catch (error) {
        console.error('Get experiences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create a new experience
export async function createExperience(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const validation = experienceSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        // Get or create profile
        let profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
            profile = await prisma.profile.create({ data: { userId } });
        }

        const experience = await prisma.experience.create({
            data: {
                profileId: profile.id,
                ...validation.data,
            },
        });

        res.status(201).json({ message: 'Experience created successfully', experience });
    } catch (error) {
        console.error('Create experience error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update an existing experience
export async function updateExperience(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const validation = experienceSchema.safeParse(req.body);
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

        const existing = await prisma.experience.findFirst({
            where: { id, profileId: profile.id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Experience not found' });
            return;
        }

        const experience = await prisma.experience.update({
            where: { id },
            data: validation.data,
        });

        res.json({ message: 'Experience updated successfully', experience });
    } catch (error) {
        console.error('Update experience error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete an experience
export async function deleteExperience(req: AuthRequest, res: Response): Promise<void> {
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

        const existing = await prisma.experience.findFirst({
            where: { id, profileId: profile.id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Experience not found' });
            return;
        }

        await prisma.experience.delete({ where: { id } });

        res.json({ message: 'Experience deleted successfully' });
    } catch (error) {
        console.error('Delete experience error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
