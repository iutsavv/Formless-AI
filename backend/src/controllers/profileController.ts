import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const profileSchema = z.object({
    // Personal Information
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),

    // Professional Information
    currentJobTitle: z.string().optional().nullable(),
    currentCompany: z.string().optional().nullable(),
    linkedinUrl: z.string().url().optional().nullable().or(z.literal('')),
    portfolioUrl: z.string().url().optional().nullable().or(z.literal('')),
    githubUrl: z.string().url().optional().nullable().or(z.literal('')),

    // Work Authorization
    workAuthorization: z.string().optional().nullable(),
    willingToRelocate: z.boolean().optional(),
    salaryExpectation: z.string().optional().nullable(),
    availableStartDate: z.string().optional().nullable(),

    // Education
    degree: z.string().optional().nullable(),
    university: z.string().optional().nullable(),
    graduationYear: z.string().optional().nullable(),
    gpa: z.string().optional().nullable(),
    fieldOfStudy: z.string().optional().nullable(),

    // Experience & Skills
    yearsOfExperience: z.string().optional().nullable(),
    skills: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),

    // Resume & Cover Letter
    resumeFileName: z.string().optional().nullable(),
    resumeData: z.string().optional().nullable(),
    coverLetter: z.string().optional().nullable(),
});

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const profile = await prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            // Create empty profile if doesn't exist
            const newProfile = await prisma.profile.create({
                data: { userId },
            });
            res.json({ profile: newProfile });
            return;
        }

        res.json({ profile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const validation = profileSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        // Clean empty strings to null for URL fields
        const data = { ...validation.data };
        if (data.linkedinUrl === '') data.linkedinUrl = null;
        if (data.portfolioUrl === '') data.portfolioUrl = null;
        if (data.githubUrl === '') data.githubUrl = null;

        const profile = await prisma.profile.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });

        res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get profile data formatted for extension auto-fill
export async function getProfileForFill(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const profile = await prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            res.json({ profile: null, fieldMappings: {} });
            return;
        }

        // Create field mappings for common form field names
        const fieldMappings: Record<string, string | boolean | null> = {
            // Name variations
            'first_name': profile.firstName,
            'firstName': profile.firstName,
            'first-name': profile.firstName,
            'fname': profile.firstName,
            'last_name': profile.lastName,
            'lastName': profile.lastName,
            'last-name': profile.lastName,
            'lname': profile.lastName,
            'name': `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || null,
            'full_name': `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || null,
            'fullName': `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || null,

            // Contact
            'email': profile.email,
            'e-mail': profile.email,
            'emailAddress': profile.email,
            'email_address': profile.email,
            'phone': profile.phone,
            'telephone': profile.phone,
            'phone_number': profile.phone,
            'phoneNumber': profile.phone,
            'mobile': profile.phone,

            // Address
            'address': profile.address,
            'street': profile.address,
            'street_address': profile.address,
            'city': profile.city,
            'state': profile.state,
            'province': profile.state,
            'zip': profile.zipCode,
            'zipCode': profile.zipCode,
            'zip_code': profile.zipCode,
            'postal_code': profile.zipCode,
            'postalCode': profile.zipCode,
            'country': profile.country,

            // Professional
            'current_title': profile.currentJobTitle,
            'currentTitle': profile.currentJobTitle,
            'job_title': profile.currentJobTitle,
            'jobTitle': profile.currentJobTitle,
            'title': profile.currentJobTitle,
            'current_company': profile.currentCompany,
            'currentCompany': profile.currentCompany,
            'company': profile.currentCompany,
            'employer': profile.currentCompany,
            'linkedin': profile.linkedinUrl,
            'linkedIn': profile.linkedinUrl,
            'linkedin_url': profile.linkedinUrl,
            'linkedinUrl': profile.linkedinUrl,
            'portfolio': profile.portfolioUrl,
            'portfolioUrl': profile.portfolioUrl,
            'portfolio_url': profile.portfolioUrl,
            'website': profile.portfolioUrl,
            'github': profile.githubUrl,
            'githubUrl': profile.githubUrl,
            'github_url': profile.githubUrl,

            // Work Authorization
            'work_authorization': profile.workAuthorization,
            'workAuthorization': profile.workAuthorization,
            'visa_status': profile.workAuthorization,
            'visaStatus': profile.workAuthorization,
            'willing_to_relocate': profile.willingToRelocate,
            'willingToRelocate': profile.willingToRelocate,
            'relocate': profile.willingToRelocate,
            'salary': profile.salaryExpectation,
            'salary_expectation': profile.salaryExpectation,
            'salaryExpectation': profile.salaryExpectation,
            'expected_salary': profile.salaryExpectation,
            'start_date': profile.availableStartDate,
            'startDate': profile.availableStartDate,
            'available_start_date': profile.availableStartDate,

            // Education
            'degree': profile.degree,
            'education': profile.degree,
            'university': profile.university,
            'school': profile.university,
            'college': profile.university,
            'graduation_year': profile.graduationYear,
            'graduationYear': profile.graduationYear,
            'grad_year': profile.graduationYear,
            'gpa': profile.gpa,
            'field_of_study': profile.fieldOfStudy,
            'fieldOfStudy': profile.fieldOfStudy,
            'major': profile.fieldOfStudy,

            // Experience
            'years_of_experience': profile.yearsOfExperience,
            'yearsOfExperience': profile.yearsOfExperience,
            'experience': profile.yearsOfExperience,
            'skills': profile.skills,
            'summary': profile.summary,
            'about': profile.summary,
            'bio': profile.summary,
            'cover_letter': profile.coverLetter,
            'coverLetter': profile.coverLetter,
        };

        res.json({ profile, fieldMappings });
    } catch (error) {
        console.error('Get profile for fill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
