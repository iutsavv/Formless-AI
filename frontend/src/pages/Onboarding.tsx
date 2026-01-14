import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Profile } from '../api/client';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Play,
  Zap,
  MousePointer,
  Briefcase,
  PartyPopper,
  LayoutDashboard,
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Demo form fields for the tutorial
const DEMO_FORM_FIELDS = [
  { id: 'demo_firstName', label: 'First Name', type: 'text', profileKey: 'firstName' },
  { id: 'demo_lastName', label: 'Last Name', type: 'text', profileKey: 'lastName' },
  { id: 'demo_email', label: 'Email Address', type: 'email', profileKey: 'email' },
  { id: 'demo_phone', label: 'Phone Number', type: 'tel', profileKey: 'phone' },
  { id: 'demo_linkedin', label: 'LinkedIn URL', type: 'url', profileKey: 'linkedinUrl' },
  { id: 'demo_github', label: 'GitHub URL', type: 'url', profileKey: 'githubUrl' },
  { id: 'demo_jobTitle', label: 'Current Job Title', type: 'text', profileKey: 'currentJobTitle' },
  { id: 'demo_company', label: 'Current Company', type: 'text', profileKey: 'currentCompany' },
  { id: 'demo_experience', label: 'Years of Experience', type: 'text', profileKey: 'yearsOfExperience' },
  { id: 'demo_degree', label: 'Highest Degree', type: 'text', profileKey: 'degree' },
  { id: 'demo_university', label: 'University / College', type: 'text', profileKey: 'university' },
  { id: 'demo_skills', label: 'Skills', type: 'text', profileKey: 'skills' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string | null>>({});
  const [isDemoFilled, setIsDemoFilled] = useState(false);
  const [isFillingDemo, setIsFillingDemo] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [demoFormValues, setDemoFormValues] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load existing profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await api.getProfile();
    if (data?.profile) {
      setProfile(data.profile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      setExtractedData(data.extracted);
      toast.success(`Extracted ${Object.keys(data.extracted).length} fields from resume!`);

      // Auto-save to profile
      const profileUpdate = { ...data.extracted };
      delete profileUpdate.resumeFileName;

      const { error } = await api.updateProfile({
        ...profile,
        ...profileUpdate,
        resumeFileName: resumeFile.name,
      });

      if (!error) {
        // Update local profile state with extracted data
        const newProfile = { ...profile, ...profileUpdate };
        setProfile(newProfile);
        toast.success('Profile updated with resume data!');
      }

      setStep(2);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkipResume = () => {
    setStep(2);
  };

  const handleFillDemo = async () => {
    setIsFillingDemo(true);

    // Get latest profile data
    const { data } = await api.getProfile();
    const profileData = data?.profile || profile;

    // Initialize demo form values
    const newValues: Record<string, string> = {};

    // Animate filling each field
    for (let i = 0; i < DEMO_FORM_FIELDS.length; i++) {
      const field = DEMO_FORM_FIELDS[i];
      const inputElement = document.getElementById(field.id) as HTMLInputElement;

      if (!inputElement) continue;

      // Get value from profile
      let value = '';
      if (profileData && field.profileKey in profileData) {
        value = (profileData as any)[field.profileKey] || '';
      }

      // If no value from profile, use placeholder demo values
      if (!value) {
        const demoValues: Record<string, string> = {
          firstName: 'John',
          lastName: 'Doe',
          email: profileData?.email || 'john.doe@email.com',
          phone: '+1 555-123-4567',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          githubUrl: 'https://github.com/johndoe',
          currentJobTitle: 'Software Engineer',
          currentCompany: 'Tech Corp',
          yearsOfExperience: '5',
          degree: 'Bachelor',
          university: 'MIT',
          skills: 'JavaScript, React, Node.js, Python',
        };
        value = demoValues[field.profileKey] || '';
      }

      // Animate typing
      inputElement.focus();
      inputElement.classList.add('filling');

      await new Promise(resolve => setTimeout(resolve, 80));

      // Type each character
      for (let j = 0; j <= value.length; j++) {
        inputElement.value = value.substring(0, j);
        newValues[field.id] = value.substring(0, j);
        setDemoFormValues({ ...newValues });
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      inputElement.classList.remove('filling');
      inputElement.classList.add('filled');

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setDemoFormValues(newValues);
    setIsDemoFilled(true);
    setIsFillingDemo(false);
    toast.success('Form filled automatically! This is how JobFill works.');
  };

  const handleSubmitDemo = () => {
    setIsSubmitted(true);
    toast.success('Application submitted successfully!');
  };

  const handleGoToDashboard = () => {
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Progress Indicator */}
          <div className="onboarding-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Upload Resume</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Try Demo</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${isSubmitted ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Ready!</span>
            </div>
          </div>

          {/* Step 1: Resume Upload */}
          {step === 1 && (
            <div className="onboarding-card animate-fade-in">
              <div className="onboarding-header">
                <div className="onboarding-icon">
                  <Sparkles size={32} />
                </div>
                <h1>Welcome to JobFill!</h1>
                <p>Let's set up your profile in seconds. Upload your resume and we'll extract your details automatically.</p>
              </div>

              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {resumeFile ? (
                  <div className="file-selected">
                    <FileText size={48} />
                    <p className="file-name">{resumeFile.name}</p>
                    <p className="file-size">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <>
                    <Upload size={48} />
                    <p>Click to upload your resume</p>
                    <span className="upload-hint">PDF, DOC, DOCX, or TXT (max 10MB)</span>
                  </>
                )}
              </div>

              <div className="onboarding-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleUploadResume}
                  disabled={!resumeFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Parse & Extract Details
                    </>
                  )}
                </button>

                <button className="btn btn-ghost" onClick={handleSkipResume}>
                  Skip for now, I'll fill manually
                </button>
              </div>

              {Object.keys(extractedData).length > 0 && (
                <div className="extracted-preview">
                  <h4>✅ Extracted Data:</h4>
                  <div className="extracted-fields">
                    {Object.entries(extractedData).map(([key, value]) => (
                      value && (
                        <div key={key} className="extracted-field">
                          <span className="field-key">{key}:</span>
                          <span className="field-value">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Demo Form */}
          {step === 2 && !isSubmitted && (
            <div className="onboarding-card animate-fade-in">
              <div className="onboarding-header">
                <div className="onboarding-icon purple">
                  <Play size={32} />
                </div>
                <h1>See It In Action!</h1>
                <p>This is a sample job application form. Click the button below to watch JobFill fill it automatically with your profile data.</p>
              </div>

              <div className="demo-container">
                <div className="demo-header">
                  <Briefcase size={24} />
                  <div>
                    <h3>TechCorp Inc. - Senior Software Engineer</h3>
                    <span>Job Application Form</span>
                  </div>
                </div>

                <div className="demo-form">
                  <div className="form-grid">
                    {DEMO_FORM_FIELDS.map((field) => (
                      <div key={field.id} className="demo-field">
                        <label htmlFor={field.id}>{field.label} <span className="required">*</span></label>
                        <input
                          type={field.type}
                          id={field.id}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={demoFormValues[field.id] || ''}
                          readOnly
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {!isDemoFilled ? (
                  <div className="demo-action">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleFillDemo}
                      disabled={isFillingDemo}
                    >
                      {isFillingDemo ? (
                        <>
                          <div className="loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
                          Auto-Filling Form...
                        </>
                      ) : (
                        <>
                          <MousePointer size={20} />
                          🚀 Click to Auto-Fill This Form
                        </>
                      )}
                    </button>
                    <p className="demo-hint">
                      This simulates clicking "Fill This Page" in the browser extension
                    </p>
                  </div>
                ) : (
                  <div className="demo-action filled">
                    <div className="fill-success-banner">
                      <CheckCircle size={24} />
                      <span>All fields filled automatically!</span>
                    </div>
                    <button
                      className="btn btn-primary btn-lg submit-btn"
                      onClick={handleSubmitDemo}
                    >
                      <ArrowRight size={20} />
                      Submit Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Success - Application Submitted */}
          {isSubmitted && (
            <div className="onboarding-card animate-fade-in success-card">
              <div className="success-content">
                <div className="success-icon">
                  <PartyPopper size={64} />
                </div>
                <h1>🎉 Application Submitted Successfully!</h1>
                <p className="success-message">
                  Thank you for trying JobFill! Your demo application has been submitted.
                </p>
                <p className="success-desc">
                  Now you can use JobFill on real job application forms. Your profile is saved and ready to auto-fill forms on any job portal - LinkedIn, Indeed, Greenhouse, Lever, and more!
                </p>

                <div className="success-features">
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Profile saved with your details</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Extension ready to fill real job forms</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Unknown fields will be captured automatically</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg dashboard-btn"
                  onClick={handleGoToDashboard}
                >
                  <LayoutDashboard size={20} />
                  Go to Dashboard
                </button>

                <p className="dashboard-hint">
                  View and edit all your saved profile fields
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .onboarding-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        
        .progress-step.active {
          opacity: 1;
        }
        
        .step-number {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .progress-step.active .step-number {
          background: var(--accent-gradient);
          border-color: transparent;
          color: white;
        }
        
        .progress-step span {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .progress-line {
          width: 80px;
          height: 2px;
          background: var(--border-color);
        }
        
        .onboarding-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 3rem;
          backdrop-filter: blur(20px);
        }
        
        .onboarding-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .onboarding-icon {
          width: 5rem;
          height: 5rem;
          background: var(--accent-gradient);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
        }
        
        .onboarding-icon.purple {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
        }
        
        .onboarding-icon.green {
          background: linear-gradient(135deg, #10b981, #34d399);
        }
        
        .onboarding-header h1 {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        
        .onboarding-header p {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto;
        }
        
        .upload-zone {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-lg);
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 2rem;
        }
        
        .upload-zone:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.05);
        }
        
        .upload-zone svg {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        
        .upload-zone p {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .upload-hint {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .file-selected {
          color: var(--accent-primary);
        }
        
        .file-selected svg {
          color: var(--accent-primary);
        }
        
        .file-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .file-size {
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        
        .onboarding-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .extracted-preview {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-lg);
        }
        
        .extracted-preview h4 {
          margin-bottom: 1rem;
          color: var(--success);
        }
        
        .extracted-fields {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.5rem;
        }
        
        .extracted-field {
          font-size: 0.875rem;
        }
        
        .field-key {
          color: var(--text-muted);
          margin-right: 0.5rem;
        }
        
        .field-value {
          color: var(--text-primary);
        }
        
        /* Demo Form Styles */
        .demo-container {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        
        .demo-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
        }
        
        .demo-header h3 {
          margin: 0;
          font-size: 1.125rem;
        }
        
        .demo-header span {
          font-size: 0.875rem;
          opacity: 0.8;
        }
        
        .demo-form {
          padding: 1.5rem;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .demo-field label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.375rem;
        }
        
        .demo-field .required {
          color: var(--error);
        }
        
        .demo-field input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          transition: all 0.2s;
        }
        
        .demo-field input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        
        .demo-field input.filling {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          background: rgba(99, 102, 241, 0.05);
        }
        
        .demo-field input.filled {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--success);
        }
        
        .demo-action {
          padding: 1.5rem;
          text-align: center;
          border-top: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }
        
        .demo-action.filled {
          background: rgba(16, 185, 129, 0.05);
        }
        
        .demo-hint {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .fill-success-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.15);
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          color: var(--success);
          font-weight: 600;
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .submit-btn:hover {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        /* Success Card */
        .success-card {
          text-align: center;
          padding: 4rem 3rem;
        }
        
        .success-content {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .success-icon {
          width: 6rem;
          height: 6rem;
          background: linear-gradient(135deg, #10b981, #34d399);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: white;
          box-shadow: 0 0 60px rgba(16, 185, 129, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .success-card h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--success);
        }
        
        .success-message {
          font-size: 1.25rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        
        .success-desc {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .success-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
          text-align: left;
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
        }
        
        .feature-item svg {
          color: var(--success);
          flex-shrink: 0;
        }
        
        .dashboard-btn {
          padding: 1rem 3rem !important;
          font-size: 1.125rem !important;
        }
        
        .dashboard-hint {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
      `}</style>
    </>
  );
}
