// Content Script - Form Detection and Filling
// Enhanced version with better field matching

// Common field mappings for job applications (expanded)
const FIELD_PATTERNS = {
    // Name fields
    firstName: [
        'first_name', 'firstname', 'first-name', 'fname', 'given_name', 'givenname',
        'first', 'forename', 'prenom', 'nombre'
    ],
    lastName: [
        'last_name', 'lastname', 'last-name', 'lname', 'family_name', 'familyname',
        'surname', 'last', 'apellido', 'nom'
    ],
    fullName: [
        'full_name', 'fullname', 'full-name', 'name', 'your_name', 'applicant_name',
        'candidate_name', 'legal_name', 'displayname'
    ],

    // Contact fields
    email: [
        'email', 'e-mail', 'email_address', 'emailaddress', 'mail', 'correo',
        'email_id', 'emailid', 'useremail', 'user_email', 'work_email', 'primary_email'
    ],
    phone: [
        'phone', 'telephone', 'tel', 'phone_number', 'phonenumber', 'mobile',
        'cell', 'cellphone', 'mobile_phone', 'contact_number', 'primary_phone',
        'phone_num', 'phonenum', 'telefono', 'numero'
    ],

    // Address fields
    address: [
        'address', 'street', 'street_address', 'streetaddress', 'address_line',
        'address1', 'address_1', 'street_line', 'mailing_address', 'home_address',
        'direccion'
    ],
    city: ['city', 'town', 'locality', 'ciudad', 'ville'],
    state: ['state', 'province', 'region', 'administrative_area', 'estado', 'provincia'],
    zipCode: [
        'zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'postalcode',
        'post_code', 'postcode', 'pin', 'pincode'
    ],
    country: ['country', 'nation', 'country_code', 'pais', 'location_country'],

    // Professional fields
    currentJobTitle: [
        'current_title', 'currenttitle', 'job_title', 'jobtitle', 'title',
        'position', 'current_position', 'role', 'current_role', 'designation',
        'headline', 'professional_title', 'occupation'
    ],
    currentCompany: [
        'current_company', 'currentcompany', 'company', 'employer', 'current_employer',
        'organization', 'company_name', 'companyname', 'employer_name', 'organisation',
        'most_recent_company', 'latest_company'
    ],

    // URLs
    linkedinUrl: [
        'linkedin', 'linkedin_url', 'linkedinurl', 'linkedin_profile',
        'linkedin_link', 'li_url', 'profile_linkedin', 'social_linkedin'
    ],
    githubUrl: [
        'github', 'github_url', 'githuburl', 'github_profile', 'github_link',
        'gh_url', 'git_url', 'giturl'
    ],
    portfolioUrl: [
        'portfolio', 'website', 'portfolio_url', 'personal_website', 'url',
        'homepage', 'personal_url', 'web_url', 'site', 'blog'
    ],

    // Work authorization
    workAuthorization: [
        'work_authorization', 'workauthorization', 'visa', 'visa_status',
        'authorization', 'eligible_to_work', 'sponsorship', 'work_permit',
        'immigration_status', 'require_sponsorship', 'authorized_to_work'
    ],
    willingToRelocate: [
        'relocate', 'willing_to_relocate', 'relocation', 'open_to_relocation',
        'can_relocate', 'willing_relocate', 'open_relocation', 'relocation_willing'
    ],
    salaryExpectation: [
        'salary', 'salary_expectation', 'expected_salary', 'compensation',
        'desired_salary', 'pay', 'salary_requirements', 'salary_desired',
        'compensation_expectation', 'salary_range'
    ],
    availableStartDate: [
        'start_date', 'startdate', 'available_start', 'availability',
        'available_date', 'earliest_start', 'notice_period', 'when_start',
        'date_available', 'available_from'
    ],

    // Education
    degree: [
        'degree', 'education', 'education_level', 'highest_degree',
        'qualification', 'academic_degree', 'degree_type'
    ],
    university: [
        'university', 'school', 'college', 'institution', 'alma_mater',
        'school_name', 'university_name', 'institution_name', 'college_name'
    ],
    graduationYear: [
        'graduation_year', 'graduationyear', 'grad_year', 'year_graduated',
        'graduation_date', 'grad_date', 'year_of_graduation', 'graduation'
    ],
    gpa: ['gpa', 'grade_point', 'grades', 'cgpa', 'grade', 'grade_average'],
    fieldOfStudy: [
        'field_of_study', 'fieldofstudy', 'major', 'concentration',
        'specialization', 'area_of_study', 'course', 'program', 'discipline'
    ],

    // Experience
    yearsOfExperience: [
        'years_of_experience', 'yearsofexperience', 'experience',
        'total_experience', 'years_experience', 'work_experience',
        'exp_years', 'professional_experience', 'experience_years'
    ],
    skills: [
        'skills', 'skill_set', 'skillset', 'technologies', 'competencies',
        'technical_skills', 'abilities', 'expertise', 'qualifications', 'proficiencies'
    ],
    summary: [
        'summary', 'about', 'bio', 'about_me', 'professional_summary',
        'objective', 'profile', 'description', 'about_yourself', 'introduction'
    ],
    coverLetter: [
        'cover_letter', 'coverletter', 'cover', 'motivation_letter',
        'application_letter', 'letter', 'message', 'why_interested'
    ],
};

// Build reverse lookup map for faster matching
const REVERSE_LOOKUP = {};
for (const [fieldKey, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
        REVERSE_LOOKUP[pattern.toLowerCase()] = fieldKey;
    }
}

// Normalize string for matching
function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '');
}

// Extract words from string
function extractWords(str) {
    if (!str) return [];
    return str.toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, ' ')
        .split(/[\s_-]+/)
        .filter(w => w.length > 1);
}

// Find best match for a field using multiple strategies
function findFieldMatch(identifiers, fieldMappings) {
    // Strategy 1: Direct key match in fieldMappings
    for (const identifier of identifiers) {
        if (fieldMappings[identifier] !== undefined && fieldMappings[identifier] !== null) {
            return fieldMappings[identifier];
        }
    }

    // Strategy 2: Normalized key match
    for (const identifier of identifiers) {
        const normalized = normalize(identifier);
        for (const [key, value] of Object.entries(fieldMappings)) {
            if (normalize(key) === normalized && value !== null && value !== undefined) {
                return value;
            }
        }
    }

    // Strategy 3: Pattern-based lookup
    for (const identifier of identifiers) {
        const normalized = normalize(identifier);

        // Check reverse lookup
        if (REVERSE_LOOKUP[normalized]) {
            const fieldKey = REVERSE_LOOKUP[normalized];
            // Find this key in fieldMappings
            for (const [mapKey, value] of Object.entries(fieldMappings)) {
                if (normalize(mapKey) === normalize(fieldKey) && value !== null) {
                    return value;
                }
                // Check if mapKey contains the pattern
                if (normalize(mapKey).includes(normalized) && value !== null) {
                    return value;
                }
            }
        }

        // Check each pattern group
        for (const [fieldKey, patterns] of Object.entries(FIELD_PATTERNS)) {
            for (const pattern of patterns) {
                if (normalized.includes(normalize(pattern)) || normalize(pattern).includes(normalized)) {
                    // Find matching value in fieldMappings
                    for (const [mapKey, value] of Object.entries(fieldMappings)) {
                        if (mapKey.toLowerCase().includes(pattern.toLowerCase()) ||
                            pattern.toLowerCase().includes(mapKey.toLowerCase())) {
                            if (value !== null && value !== undefined && value !== '') {
                                return value;
                            }
                        }
                    }
                }
            }
        }
    }

    // Strategy 4: Word-based partial matching
    for (const identifier of identifiers) {
        const words = extractWords(identifier);
        for (const word of words) {
            if (word.length < 3) continue;

            for (const [mapKey, value] of Object.entries(fieldMappings)) {
                const mapWords = extractWords(mapKey);
                if (mapWords.some(mw => mw.includes(word) || word.includes(mw))) {
                    if (value !== null && value !== undefined && value !== '') {
                        return value;
                    }
                }
            }
        }
    }

    return null;
}

// Get all possible identifiers for a field
function getFieldIdentifiers(element) {
    const identifiers = [];

    // Add direct attributes
    if (element.name) identifiers.push(element.name);
    if (element.id) identifiers.push(element.id);
    if (element.placeholder) identifiers.push(element.placeholder);
    if (element.getAttribute('aria-label')) identifiers.push(element.getAttribute('aria-label'));
    if (element.getAttribute('data-testid')) identifiers.push(element.getAttribute('data-testid'));
    if (element.getAttribute('data-field')) identifiers.push(element.getAttribute('data-field'));
    if (element.getAttribute('autocomplete')) identifiers.push(element.getAttribute('autocomplete'));

    // Find associated label by 'for' attribute
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) {
            const labelText = label.textContent.trim().replace(/[*:]/g, '').trim();
            if (labelText) identifiers.push(labelText);
        }
    }

    // Check parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
        let labelText = '';
        for (const child of parentLabel.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                labelText += child.textContent;
            }
        }
        labelText = labelText.trim().replace(/[*:]/g, '').trim();
        if (labelText) identifiers.push(labelText);
    }

    // Check previous sibling for label-like text
    let sibling = element.previousElementSibling;
    if (sibling && (sibling.tagName === 'LABEL' || sibling.tagName === 'SPAN' || sibling.tagName === 'DIV')) {
        const text = sibling.textContent.trim().replace(/[*:]/g, '').trim();
        if (text && text.length < 50) identifiers.push(text);
    }

    // Check parent's previous sibling or parent's child labels
    const parent = element.parentElement;
    if (parent) {
        const labels = parent.querySelectorAll('label, .label, [class*="label"]');
        labels.forEach(label => {
            const text = label.textContent.trim().replace(/[*:]/g, '').trim();
            if (text && text.length < 50 && !identifiers.includes(text)) {
                identifiers.push(text);
            }
        });
    }

    return identifiers.filter(id => id && id.length > 0);
}

// Fill form fields
function fillForm(fieldMappings) {
    // Find all form elements
    const selectors = [
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]):not([type="image"]):not([type="reset"])',
        'textarea',
        'select'
    ];

    const inputs = document.querySelectorAll(selectors.join(', '));
    let filledCount = 0;
    let unknownFields = [];

    console.log('[JobFill] Found', inputs.length, 'form elements');
    console.log('[JobFill] Field mappings:', Object.keys(fieldMappings).length, 'keys');

    inputs.forEach((input) => {
        // Skip disabled or readonly inputs
        if (input.disabled || input.readOnly) return;

        // Skip if already has a meaningful value (except for checkboxes)
        if (input.type !== 'checkbox' && input.type !== 'radio') {
            if (input.value && input.value.trim() !== '') return;
        }

        const identifiers = getFieldIdentifiers(input);

        if (identifiers.length === 0) {
            console.log('[JobFill] No identifiers for:', input);
            return;
        }

        console.log('[JobFill] Checking field:', identifiers[0], '| All:', identifiers);

        const value = findFieldMatch(identifiers, fieldMappings);

        if (value !== null && value !== undefined) {
            console.log('[JobFill] Filling:', identifiers[0], '=', value);

            if (input.type === 'checkbox') {
                const boolValue = value === true || value === 'true' || value === '1' || value === 'yes';
                if (input.checked !== boolValue) {
                    input.checked = boolValue;
                    triggerEvents(input);
                }
            } else if (input.type === 'radio') {
                const normalizedValue = normalize(String(value));
                const inputValue = normalize(input.value);
                if (normalizedValue === inputValue || inputValue.includes(normalizedValue)) {
                    if (!input.checked) {
                        input.checked = true;
                        triggerEvents(input);
                    }
                }
            } else if (input.tagName === 'SELECT') {
                const options = Array.from(input.options);
                const normalizedValue = normalize(String(value));

                // Find matching option
                const matchingOption = options.find(opt => {
                    const optVal = normalize(opt.value);
                    const optText = normalize(opt.text);
                    return optVal === normalizedValue ||
                        optText === normalizedValue ||
                        optVal.includes(normalizedValue) ||
                        optText.includes(normalizedValue) ||
                        normalizedValue.includes(optVal) ||
                        normalizedValue.includes(optText);
                });

                if (matchingOption && input.value !== matchingOption.value) {
                    input.value = matchingOption.value;
                    triggerEvents(input);
                    filledCount++;
                }
            } else {
                input.value = String(value);
                triggerEvents(input);
                filledCount++;
            }
        } else {
            // Track as unknown field
            unknownFields.push({
                fieldName: input.name || input.id || identifiers[0],
                fieldLabel: getFieldLabel(input),
                fieldType: input.type || input.tagName.toLowerCase(),
                placeholder: input.placeholder || null,
            });
        }
    });

    console.log('[JobFill] Filled:', filledCount, '| Unknown:', unknownFields.length);
    return { filled: filledCount, unknown: unknownFields.length };
}

// Trigger form events for React/Angular/Vue compatibility
function triggerEvents(element) {
    // Native events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    // React synthetic events (for controlled inputs)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    )?.set;

    if (nativeInputValueSetter && element.tagName === 'INPUT') {
        nativeInputValueSetter.call(element, element.value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Focus then blur for validation
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    setTimeout(() => {
        element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }, 50);
}

// Get human-readable label for a field
function getFieldLabel(element) {
    // Check for associated label
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent.trim().replace(/[*:]/g, '').trim();
    }

    // Check parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
        const clone = parentLabel.cloneNode(true);
        clone.querySelectorAll('input, textarea, select').forEach(el => el.remove());
        return clone.textContent.trim().replace(/[*:]/g, '').trim();
    }

    // Use placeholder or aria-label
    return element.placeholder || element.getAttribute('aria-label') || null;
}

// Capture all form fields on the page
function captureFields() {
    const selectors = [
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]):not([type="image"]):not([type="reset"]):not([type="password"])',
        'textarea',
        'select'
    ];

    const inputs = document.querySelectorAll(selectors.join(', '));
    const fields = [];
    const pageUrl = window.location.href;
    const pageDomain = window.location.hostname;

    inputs.forEach((input) => {
        if (input.disabled) return;

        // Skip if no identifying information
        const identifiers = getFieldIdentifiers(input);
        if (identifiers.length === 0 && !input.name && !input.id) return;

        const fieldName = input.name || input.id || identifiers[0] || `field_${fields.length}`;
        const fieldLabel = getFieldLabel(input);

        // Skip if we already have this field
        if (fields.some(f => f.fieldName === fieldName)) return;

        fields.push({
            fieldName,
            fieldLabel,
            fieldType: input.type || input.tagName.toLowerCase(),
            placeholder: input.placeholder || null,
            pageUrl,
            pageDomain,
        });
    });

    console.log('[JobFill] Captured', fields.length, 'fields');
    return fields;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[JobFill] Received message:', message.action);

    if (message.action === 'fillForm') {
        try {
            const result = fillForm(message.data);
            sendResponse({ success: true, ...result });
        } catch (error) {
            console.error('[JobFill] Fill error:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }

    if (message.action === 'captureFields') {
        try {
            const fields = captureFields();
            sendResponse({ success: true, fields });
        } catch (error) {
            console.error('[JobFill] Capture error:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }

    return true;
});

// Log that content script is loaded
console.log('[JobFill] Content script loaded on:', window.location.hostname);
