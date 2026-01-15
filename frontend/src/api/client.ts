const API_BASE_URL = '/api';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

class ApiClient {
    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                // If unauthorized, clear token
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return { error: data.error || 'An error occurred' };
            }

            return { data };
        } catch (error) {
            console.error('API Error:', error);
            return { error: 'Network error. Please try again.' };
        }
    }

    // Auth endpoints
    async register(email: string, password: string) {
        return this.request<{ token: string; user: { id: string; email: string } }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async login(email: string, password: string) {
        return this.request<{ token: string; user: { id: string; email: string } }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getMe() {
        return this.request<{ user: { id: string; email: string; createdAt: string } }>('/auth/me');
    }

    // Profile endpoints
    async getProfile() {
        return this.request<{ profile: Profile }>('/profile');
    }

    async updateProfile(profile: Partial<Profile>) {
        return this.request<{ profile: Profile }>('/profile', {
            method: 'PUT',
            body: JSON.stringify(profile),
        });
    }

    // Unknown fields endpoints
    async getUnknownFields() {
        return this.request<{ fields: UnknownField[]; groupedByDomain: Record<string, UnknownField[]> }>('/unknown-fields');
    }

    async updateFieldValue(id: string, userValue: string | null) {
        return this.request<{ field: UnknownField }>(`/unknown-fields/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ userValue }),
        });
    }

    async deleteField(id: string) {
        return this.request<{ message: string }>(`/unknown-fields/${id}`, {
            method: 'DELETE',
        });
    }

    async bulkUpdateFields(updates: Array<{ id: string; userValue: string | null }>) {
        return this.request<{ fields: UnknownField[] }>('/unknown-fields/bulk', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }
}

// Types
export interface Profile {
    id: string;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
    currentJobTitle: string | null;
    currentCompany: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    githubUrl: string | null;
    workAuthorization: string | null;
    willingToRelocate: boolean;
    salaryExpectation: string | null;
    availableStartDate: string | null;
    // Education fields
    degree: string | null;
    university: string | null;
    fieldOfStudy: string | null;
    gpa: string | null;
    educationStartMonth: string | null;
    educationStartYear: string | null;
    educationEndMonth: string | null;
    educationEndYear: string | null;
    graduationYear: string | null;
    // Work Experience fields
    yearsOfExperience: string | null;
    jobTitle: string | null;
    companyName: string | null;
    workStartMonth: string | null;
    workStartYear: string | null;
    workEndMonth: string | null;
    workEndYear: string | null;
    isCurrentJob: boolean;
    jobDescription: string | null;
    // Skills & other
    skills: string | null;
    softSkills: string | null;
    languages: string | null;
    certifications: string | null;
    summary: string | null;
    resumeFileName: string | null;
    resumeData: string | null;
    coverLetter: string | null;
}


export interface UnknownField {
    id: string;
    userId: string;
    fieldName: string;
    fieldLabel: string | null;
    fieldType: string;
    placeholder: string | null;
    pageUrl: string;
    pageDomain: string;
    userValue: string | null;
    createdAt: string;
    updatedAt: string;
}

export const api = new ApiClient();
