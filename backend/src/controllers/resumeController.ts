import { Response } from 'express';
import pdfParse from 'pdf-parse';
import { AuthRequest } from '../middleware/auth';

// Parse resume text and extract structured data
function parseResumeText(text: string): Record<string, string | null> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const result: Record<string, string | null> = {};

    // Email extraction
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
        result.email = emailMatch[0];
    }

    // Phone extraction (various formats)
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
        result.phone = phoneMatch[0].replace(/[^\d+]/g, '').replace(/^1/, '+1 ');
    }

    // LinkedIn URL
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
        result.linkedinUrl = 'https://www.' + linkedinMatch[0];
    }

    // GitHub URL
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) {
        result.githubUrl = 'https://' + githubMatch[0];
    }

    // Portfolio/Website
    const websiteMatch = text.match(/(?:portfolio|website|www\.)[\w.-]+\.\w+/i);
    if (websiteMatch) {
        result.portfolioUrl = websiteMatch[0].startsWith('http')
            ? websiteMatch[0]
            : 'https://' + websiteMatch[0];
    }

    // Name - usually first non-empty line that's not contact info
    for (const line of lines.slice(0, 5)) {
        if (line &&
            !line.includes('@') &&
            !line.match(/^\+?\d/) &&
            !line.match(/linkedin|github|http/i) &&
            line.length < 50) {
            const nameParts = line.split(/\s+/);
            if (nameParts.length >= 2 && nameParts.length <= 4) {
                result.firstName = nameParts[0];
                result.lastName = nameParts.slice(1).join(' ');
                break;
            } else if (nameParts.length === 1 && nameParts[0].length > 1) {
                result.firstName = nameParts[0];
                break;
            }
        }
    }

    // Education section
    const educationKeywords = ['education', 'academic', 'university', 'college', 'degree', 'bachelor', 'master', 'phd', 'b.s', 'b.a', 'm.s', 'm.a', 'mba'];
    const degreePatterns = [
        /(?:bachelor|b\.?s\.?|b\.?a\.?)\s*(?:of|in)?\s*(?:science|arts|engineering)?/i,
        /(?:master|m\.?s\.?|m\.?a\.?)\s*(?:of|in)?\s*(?:science|arts|engineering|business)?/i,
        /(?:ph\.?d\.?|doctorate)/i,
        /mba/i,
    ];

    const textLower = text.toLowerCase();
    for (const pattern of degreePatterns) {
        const match = text.match(pattern);
        if (match) {
            if (/bachelor|b\.?s|b\.?a/i.test(match[0])) {
                result.degree = 'Bachelor';
            } else if (/master|m\.?s|m\.?a/i.test(match[0])) {
                result.degree = 'Master';
            } else if (/mba/i.test(match[0])) {
                result.degree = 'MBA';
            } else if (/ph\.?d|doctorate/i.test(match[0])) {
                result.degree = 'PhD';
            }
            break;
        }
    }

    // University detection
    const universityPatterns = [
        /(?:university|college|institute|school)\s+of\s+[\w\s]+/i,
        /[\w\s]+\s+(?:university|college|institute)/i,
    ];
    for (const pattern of universityPatterns) {
        const match = text.match(pattern);
        if (match && match[0].length > 5) {
            result.university = match[0].trim();
            break;
        }
    }

    // Graduation year
    const yearMatch = text.match(/(?:graduated?|class\s+of|20[0-2][0-9]|19[89][0-9])/i);
    if (yearMatch) {
        const yearNumMatch = text.slice(text.indexOf(yearMatch[0])).match(/20[0-2][0-9]|19[89][0-9]/);
        if (yearNumMatch) {
            result.graduationYear = yearNumMatch[0];
        }
    }

    // Skills extraction
    const skillsSection = text.match(/skills?[:\s]*([\s\S]*?)(?:\n\n|\nexperience|\neducation|\nproject|$)/i);
    if (skillsSection) {
        const skillsText = skillsSection[1];
        // Extract comma or bullet separated skills
        const skills = skillsText
            .replace(/[•\-\*]/g, ',')
            .split(/[,\n]/)
            .map(s => s.trim())
            .filter(s => s.length > 1 && s.length < 30 && !s.match(/^\d/))
            .slice(0, 20);
        if (skills.length > 0) {
            result.skills = skills.join(', ');
        }
    }

    // Experience/Job title
    const titlePatterns = [
        /(?:senior|junior|lead|staff|principal)?\s*(?:software|web|mobile|frontend|backend|full[\s-]?stack)?\s*(?:engineer|developer|architect|manager|designer|analyst)/i,
        /(?:data|machine\s+learning|ai|ml)\s*(?:scientist|engineer|analyst)/i,
        /(?:product|project|program)\s*manager/i,
        /(?:devops|sre|cloud)\s*engineer/i,
    ];

    for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match) {
            result.currentJobTitle = match[0].trim();
            break;
        }
    }

    // Years of experience
    const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?/i);
    if (expMatch) {
        result.yearsOfExperience = expMatch[1];
    }

    // Summary/Objective - often at the beginning
    const summaryMatch = text.match(/(?:summary|objective|about|profile)[:\s]*([\s\S]{50,300}?)(?:\n\n|experience|education|skills)/i);
    if (summaryMatch) {
        result.summary = summaryMatch[1].trim().replace(/\s+/g, ' ');
    }

    // Address components (basic extraction)
    const cityStateMatch = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z]{2})\s*(\d{5})?/);
    if (cityStateMatch) {
        result.city = cityStateMatch[1];
        result.state = cityStateMatch[2];
        if (cityStateMatch[3]) {
            result.zipCode = cityStateMatch[3];
        }
    }

    return result;
}

// Handle resume upload and parsing
export async function parseResume(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const buffer = req.file.buffer;

        // Parse PDF
        let text = '';
        try {
            const pdfData = await pdfParse(buffer);
            text = pdfData.text;
        } catch (pdfError) {
            // If PDF parsing fails, try to read as text
            text = buffer.toString('utf-8');
        }

        if (!text || text.trim().length < 50) {
            res.status(400).json({ error: 'Could not extract text from file. Please ensure it is a valid PDF or text file.' });
            return;
        }

        // Parse the resume text
        const extractedData = parseResumeText(text);

        // Store the filename
        extractedData.resumeFileName = req.file.originalname;

        res.json({
            message: 'Resume parsed successfully',
            extracted: extractedData,
            rawTextLength: text.length,
        });
    } catch (error) {
        console.error('Resume parsing error:', error);
        res.status(500).json({ error: 'Failed to parse resume' });
    }
}
