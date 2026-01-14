import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const unknownFieldSchema = z.object({
    fieldName: z.string().min(1, 'Field name is required'),
    fieldLabel: z.string().optional().nullable(),
    fieldType: z.string().default('text'),
    placeholder: z.string().optional().nullable(),
    pageUrl: z.string().url('Invalid URL'),
    pageDomain: z.string().min(1, 'Domain is required'),
});

const updateValueSchema = z.object({
    userValue: z.string().nullable(),
});

const bulkCreateSchema = z.array(unknownFieldSchema);

// Get all unknown fields for the user
export async function getUnknownFields(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { domain } = req.query;

        const where: any = { userId };
        if (domain && typeof domain === 'string') {
            where.pageDomain = domain;
        }

        const fields = await prisma.unknownField.findMany({
            where,
            orderBy: [{ pageDomain: 'asc' }, { createdAt: 'desc' }],
        });

        // Group by domain for easier display
        const groupedByDomain = fields.reduce((acc: Record<string, typeof fields>, field) => {
            if (!acc[field.pageDomain]) {
                acc[field.pageDomain] = [];
            }
            acc[field.pageDomain].push(field);
            return acc;
        }, {});

        res.json({ fields, groupedByDomain });
    } catch (error) {
        console.error('Get unknown fields error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get unknown fields for a specific domain (for extension use)
export async function getUnknownFieldsForDomain(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { domain } = req.params;
        if (!domain) {
            res.status(400).json({ error: 'Domain is required' });
            return;
        }

        const fields = await prisma.unknownField.findMany({
            where: {
                userId,
                pageDomain: domain,
                userValue: { not: null },
            },
        });

        // Convert to mapping for easy lookup
        const fieldMappings: Record<string, string> = {};
        fields.forEach(field => {
            if (field.userValue) {
                fieldMappings[field.fieldName] = field.userValue;
            }
        });

        res.json({ fields, fieldMappings });
    } catch (error) {
        console.error('Get unknown fields for domain error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create/capture unknown fields (bulk from extension)
export async function createUnknownFields(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const validation = bulkCreateSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        const fieldsToCreate = validation.data;
        const createdFields = [];
        const skippedFields = [];

        for (const field of fieldsToCreate) {
            try {
                // Upsert to avoid duplicates
                const created = await prisma.unknownField.upsert({
                    where: {
                        userId_fieldName_pageDomain: {
                            userId,
                            fieldName: field.fieldName,
                            pageDomain: field.pageDomain,
                        },
                    },
                    update: {
                        fieldLabel: field.fieldLabel,
                        fieldType: field.fieldType,
                        placeholder: field.placeholder,
                        pageUrl: field.pageUrl,
                    },
                    create: {
                        userId,
                        ...field,
                    },
                });
                createdFields.push(created);
            } catch (err) {
                skippedFields.push(field.fieldName);
            }
        }

        res.status(201).json({
            message: `Captured ${createdFields.length} fields`,
            created: createdFields,
            skipped: skippedFields,
        });
    } catch (error) {
        console.error('Create unknown fields error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update the user value for an unknown field
export async function updateUnknownFieldValue(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const validation = updateValueSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        const field = await prisma.unknownField.findFirst({
            where: { id, userId },
        });

        if (!field) {
            res.status(404).json({ error: 'Field not found' });
            return;
        }

        const updated = await prisma.unknownField.update({
            where: { id },
            data: { userValue: validation.data.userValue },
        });

        res.json({ message: 'Field value updated', field: updated });
    } catch (error) {
        console.error('Update unknown field value error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete an unknown field
export async function deleteUnknownField(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const field = await prisma.unknownField.findFirst({
            where: { id, userId },
        });

        if (!field) {
            res.status(404).json({ error: 'Field not found' });
            return;
        }

        await prisma.unknownField.delete({ where: { id } });

        res.json({ message: 'Field deleted successfully' });
    } catch (error) {
        console.error('Delete unknown field error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Bulk update multiple field values
export async function bulkUpdateFieldValues(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const updates = req.body as Array<{ id: string; userValue: string | null }>;

        if (!Array.isArray(updates)) {
            res.status(400).json({ error: 'Expected array of updates' });
            return;
        }

        const results = [];
        for (const update of updates) {
            const field = await prisma.unknownField.findFirst({
                where: { id: update.id, userId },
            });

            if (field) {
                const updated = await prisma.unknownField.update({
                    where: { id: update.id },
                    data: { userValue: update.userValue },
                });
                results.push(updated);
            }
        }

        res.json({ message: `Updated ${results.length} fields`, fields: results });
    } catch (error) {
        console.error('Bulk update field values error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
