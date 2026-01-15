import { useState, useEffect, FormEvent, useMemo } from 'react';
import { api, Profile } from '../api/client';
import toast from 'react-hot-toast';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Linkedin,
    Globe,
    Github,
    GraduationCap,
    FileText,
    Save,
    CheckCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { countries, getStatesByCountry, getCitiesByState } from '../data/locations';

const initialProfile: Partial<Profile> = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    currentJobTitle: '',
    currentCompany: '',
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    workAuthorization: '',
    willingToRelocate: false,
    salaryExpectation: '',
    availableStartDate: '',
    // Education
    degree: '',
    university: '',
    fieldOfStudy: '',
    gpa: '',
    educationStartMonth: '',
    educationStartYear: '',
    educationEndMonth: '',
    educationEndYear: '',
    graduationYear: '',
    // Work Experience
    yearsOfExperience: '',
    jobTitle: '',
    companyName: '',
    workStartMonth: '',
    workStartYear: '',
    workEndMonth: '',
    workEndYear: '',
    isCurrentJob: false,
    jobDescription: '',
    // Skills & other
    skills: '',
    softSkills: '',
    languages: '',
    certifications: '',
    summary: '',
    coverLetter: '',
};


export default function ProfileForm() {
    const [profile, setProfile] = useState<Partial<Profile>>(initialProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Memoized states based on selected country
    const availableStates = useMemo(() => {
        return profile.country ? getStatesByCountry(profile.country) : [];
    }, [profile.country]);

    // Memoized cities based on selected country and state
    const availableCities = useMemo(() => {
        return profile.country && profile.state
            ? getCitiesByState(profile.country, profile.state)
            : [];
    }, [profile.country, profile.state]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data, error } = await api.getProfile();
        if (data?.profile) {
            setProfile({ ...initialProfile, ...data.profile });
        }
        setIsLoading(false);
    };

    const handleChange = (field: keyof Profile, value: string | boolean) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    // Handler for country change - resets state and city
    const handleCountryChange = (countryName: string) => {
        setProfile((prev) => ({
            ...prev,
            country: countryName,
            state: '',
            city: ''
        }));
    };

    // Handler for state change - resets city
    const handleStateChange = (stateName: string) => {
        setProfile((prev) => ({
            ...prev,
            state: stateName,
            city: ''
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const { data, error } = await api.updateProfile(profile);
        setIsSaving(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success('Profile saved successfully!');
            setLastSaved(new Date());
        }
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="loading-overlay">
                    <div className="loading-spinner" />
                    <p>Loading your profile...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container">
                    <div className="page-header">
                        <h1 className="page-title">Your Job Profile</h1>
                        <p className="page-description">
                            Fill in your details below. This information will be used to auto-fill job application forms.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="card section animate-fade-in">
                            <h3 className="section-title">
                                <User size={20} className="section-icon" />
                                Personal Information
                            </h3>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="John"
                                        value={profile.firstName || ''}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Doe"
                                        value={profile.lastName || ''}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Mail size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="john@example.com"
                                        value={profile.email || ''}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Phone size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="+1 (555) 000-0000"
                                        value={profile.phone || ''}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="card section animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <h3 className="section-title">
                                <MapPin size={20} className="section-icon" />
                                Address
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Street Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="123 Main Street, Apt 4B"
                                    value={profile.address || ''}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <select
                                        className="form-input"
                                        value={profile.country || ''}
                                        onChange={(e) => handleCountryChange(e.target.value)}
                                    >
                                        <option value="">Select country...</option>
                                        {countries.map((country) => (
                                            <option key={country.code} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State / Province</label>
                                    <select
                                        className="form-input"
                                        value={profile.state || ''}
                                        onChange={(e) => handleStateChange(e.target.value)}
                                        disabled={!profile.country}
                                    >
                                        <option value="">
                                            {profile.country ? 'Select state...' : 'Select country first'}
                                        </option>
                                        {availableStates.map((state) => (
                                            <option key={state.code} value={state.name}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <select
                                        className="form-input"
                                        value={profile.city || ''}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        disabled={!profile.state}
                                    >
                                        <option value="">
                                            {profile.state ? 'Select city...' : 'Select state first'}
                                        </option>
                                        {availableCities.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">ZIP / Postal Code</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="94102"
                                        value={profile.zipCode || ''}
                                        onChange={(e) => handleChange('zipCode', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div className="card section animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <h3 className="section-title">
                                <Briefcase size={20} className="section-icon" />
                                Work Experience
                            </h3>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Job Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Software Engineer"
                                        value={profile.jobTitle || ''}
                                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Google"
                                        value={profile.companyName || ''}
                                        onChange={(e) => handleChange('companyName', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Years of Experience</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="5"
                                        value={profile.yearsOfExperience || ''}
                                        onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="form-input"
                                            value={profile.workStartMonth || ''}
                                            onChange={(e) => handleChange('workStartMonth', e.target.value)}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Month</option>
                                            <option value="01">January</option>
                                            <option value="02">February</option>
                                            <option value="03">March</option>
                                            <option value="04">April</option>
                                            <option value="05">May</option>
                                            <option value="06">June</option>
                                            <option value="07">July</option>
                                            <option value="08">August</option>
                                            <option value="09">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Year"
                                            value={profile.workStartYear || ''}
                                            onChange={(e) => handleChange('workStartYear', e.target.value)}
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="form-input"
                                            value={profile.workEndMonth || ''}
                                            onChange={(e) => handleChange('workEndMonth', e.target.value)}
                                            style={{ flex: 1 }}
                                            disabled={profile.isCurrentJob}
                                        >
                                            <option value="">Month</option>
                                            <option value="01">January</option>
                                            <option value="02">February</option>
                                            <option value="03">March</option>
                                            <option value="04">April</option>
                                            <option value="05">May</option>
                                            <option value="06">June</option>
                                            <option value="07">July</option>
                                            <option value="08">August</option>
                                            <option value="09">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Year"
                                            value={profile.workEndYear || ''}
                                            onChange={(e) => handleChange('workEndYear', e.target.value)}
                                            style={{ width: '100px' }}
                                            disabled={profile.isCurrentJob}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={profile.isCurrentJob || false}
                                        onChange={(e) => handleChange('isCurrentJob', e.target.checked)}
                                    />
                                    <span>I currently work here</span>
                                </label>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label className="form-label">Job Description / Responsibilities</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Describe your role, responsibilities, and key achievements..."
                                    value={profile.jobDescription || ''}
                                    onChange={(e) => handleChange('jobDescription', e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label className="form-label">Professional Summary</label>
                                <textarea
                                    className="form-input"
                                    placeholder="A brief summary of your professional background and career objectives..."
                                    value={profile.summary || ''}
                                    onChange={(e) => handleChange('summary', e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="card section animate-fade-in" style={{ animationDelay: '0.25s' }}>
                            <h3 className="section-title">
                                <CheckCircle size={20} className="section-icon" />
                                Skills
                            </h3>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Technical Skills</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="JavaScript, React, Node.js, Python, SQL, AWS"
                                        value={profile.skills || ''}
                                        onChange={(e) => handleChange('skills', e.target.value)}
                                    />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        Comma-separated list of technical skills
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Soft Skills</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Leadership, Communication, Problem Solving, Team Work"
                                        value={profile.softSkills || ''}
                                        onChange={(e) => handleChange('softSkills', e.target.value)}
                                    />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        Comma-separated list of soft skills
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Languages</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="English (Fluent), Hindi (Native), Spanish (Basic)"
                                        value={profile.languages || ''}
                                        onChange={(e) => handleChange('languages', e.target.value)}
                                    />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        Languages with proficiency level
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Certifications</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="AWS Solutions Architect, Google Cloud Professional"
                                        value={profile.certifications || ''}
                                        onChange={(e) => handleChange('certifications', e.target.value)}
                                    />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        Professional certifications
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Online Profiles */}
                        <div className="card section animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <h3 className="section-title">
                                <Globe size={20} className="section-icon" />
                                Online Profiles
                            </h3>
                            <div className="grid grid-3">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Linkedin size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://linkedin.com/in/johndoe"
                                        value={profile.linkedinUrl || ''}
                                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Github size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        GitHub URL
                                    </label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://github.com/johndoe"
                                        value={profile.githubUrl || ''}
                                        onChange={(e) => handleChange('githubUrl', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Portfolio / Website</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://johndoe.com"
                                        value={profile.portfolioUrl || ''}
                                        onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Work Authorization */}
                        <div className="card section animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <h3 className="section-title">
                                <FileText size={20} className="section-icon" />
                                Work Authorization
                            </h3>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Work Authorization Status</label>
                                    <select
                                        className="form-input"
                                        value={profile.workAuthorization || ''}
                                        onChange={(e) => handleChange('workAuthorization', e.target.value)}
                                    >
                                        <option value="">Select status...</option>
                                        <option value="US Citizen">US Citizen</option>
                                        <option value="Green Card">Green Card / Permanent Resident</option>
                                        <option value="H1B">H1B Visa</option>
                                        <option value="H1B Transfer">H1B Transfer Required</option>
                                        <option value="OPT">OPT</option>
                                        <option value="OPT STEM">OPT STEM Extension</option>
                                        <option value="L1">L1 Visa</option>
                                        <option value="TN">TN Visa</option>
                                        <option value="Other">Other Work Visa</option>
                                        <option value="Sponsorship Required">Sponsorship Required</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Salary Expectation</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="$120,000 - $150,000"
                                        value={profile.salaryExpectation || ''}
                                        onChange={(e) => handleChange('salaryExpectation', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Available Start Date</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Immediately / 2 weeks notice"
                                        value={profile.availableStartDate || ''}
                                        onChange={(e) => handleChange('availableStartDate', e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={profile.willingToRelocate || false}
                                            onChange={(e) => handleChange('willingToRelocate', e.target.checked)}
                                        />
                                        <span>Willing to Relocate</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Education */}
                        <div className="card section animate-fade-in" style={{ animationDelay: '0.5s' }}>
                            <h3 className="section-title">
                                <GraduationCap size={20} className="section-icon" />
                                Education
                            </h3>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Degree</label>
                                    <select
                                        className="form-input"
                                        value={profile.degree || ''}
                                        onChange={(e) => handleChange('degree', e.target.value)}
                                    >
                                        <option value="">Select degree...</option>
                                        <option value="High School">High School Diploma</option>
                                        <option value="Associate">Associate's Degree</option>
                                        <option value="Bachelor">Bachelor's Degree</option>
                                        <option value="Master">Master's Degree</option>
                                        <option value="MBA">MBA</option>
                                        <option value="PhD">Ph.D. / Doctorate</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Field of Study / Major</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Computer Science"
                                        value={profile.fieldOfStudy || ''}
                                        onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">University / School</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Stanford University"
                                        value={profile.university || ''}
                                        onChange={(e) => handleChange('university', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GPA (optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="3.8 / 4.0"
                                        value={profile.gpa || ''}
                                        onChange={(e) => handleChange('gpa', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="form-input"
                                            value={profile.educationStartMonth || ''}
                                            onChange={(e) => handleChange('educationStartMonth', e.target.value)}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Month</option>
                                            <option value="01">January</option>
                                            <option value="02">February</option>
                                            <option value="03">March</option>
                                            <option value="04">April</option>
                                            <option value="05">May</option>
                                            <option value="06">June</option>
                                            <option value="07">July</option>
                                            <option value="08">August</option>
                                            <option value="09">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Year"
                                            value={profile.educationStartYear || ''}
                                            onChange={(e) => handleChange('educationStartYear', e.target.value)}
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date (Graduation)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="form-input"
                                            value={profile.educationEndMonth || ''}
                                            onChange={(e) => handleChange('educationEndMonth', e.target.value)}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Month</option>
                                            <option value="01">January</option>
                                            <option value="02">February</option>
                                            <option value="03">March</option>
                                            <option value="04">April</option>
                                            <option value="05">May</option>
                                            <option value="06">June</option>
                                            <option value="07">July</option>
                                            <option value="08">August</option>
                                            <option value="09">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Year"
                                            value={profile.educationEndYear || ''}
                                            onChange={(e) => handleChange('educationEndYear', e.target.value)}
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="card section animate-fade-in" style={{ animationDelay: '0.6s' }}>
                            <h3 className="section-title">
                                <FileText size={20} className="section-icon" />
                                Default Cover Letter
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Cover Letter Template</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Write a default cover letter that can be used for applications..."
                                    value={profile.coverLetter || ''}
                                    onChange={(e) => handleChange('coverLetter', e.target.value)}
                                    rows={8}
                                />
                            </div>
                        </div>


                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-xl)' }}>
                            <div>
                                {lastSaved && (
                                    <span style={{ color: 'var(--success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={16} />
                                        Last saved: {lastSaved.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <div className="loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
