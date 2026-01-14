// Formless Content Script - Robust Form Detection & Filling
// Handles modern SPAs: React, Vue, Angular, Workday, Greenhouse, Lever, LinkedIn

console.log('[Formless] Content script loaded on:', window.location.hostname);

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  SCAN_TIMEOUT_MS: 5000,        // Max time to wait for fields
  MUTATION_DEBOUNCE_MS: 100,    // Debounce mutations
  MIN_FIELDS_TO_SUCCEED: 1,     // Minimum fields needed to report success
  MAX_SCAN_RETRIES: 3,          // Max retries for initial scan
  RETRY_DELAY_MS: 500           // Delay between retries
};

// ============================================
// COMPREHENSIVE FIELD SELECTORS
// ============================================
const FIELD_SELECTORS = [
  // Standard inputs (excluding non-fillable types)
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]):not([type="image"])',
  'textarea',
  'select',
  // ARIA-based inputs (custom React/Vue components)
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="spinbutton"]',
  '[role="searchbox"]',
  // Contenteditable elements (rich text editors)
  '[contenteditable="true"]',
  // Autocomplete inputs
  '[aria-autocomplete]',
  // Data attribute patterns common in SPAs
  '[data-automation-id*="input"]',
  '[data-automation-id*="field"]',
  '[data-testid*="input"]',
  '[data-testid*="field"]'
].join(', ');

// ============================================
// FIELD PATTERN MAPPINGS (100+ patterns)
// ============================================
const FIELD_MAPPINGS = {
  // First Name patterns
  firstName: [
    'first_name', 'firstname', 'first-name', 'fname', 'first', 'given_name',
    'givenname', 'forename', 'prenom', 'nombre', 'first name', 'given name',
    'legal_first_name', 'applicant_first_name', 'candidate_first_name'
  ],

  // Last Name patterns  
  lastName: [
    'last_name', 'lastname', 'last-name', 'lname', 'last', 'family_name',
    'familyname', 'surname', 'apellido', 'nom', 'last name', 'family name',
    'legal_last_name', 'applicant_last_name', 'candidate_last_name'
  ],

  // Full Name patterns
  fullName: [
    'full_name', 'fullname', 'full-name', 'name', 'your_name', 'your name',
    'applicant_name', 'candidate_name', 'legal_name', 'displayname', 'display_name'
  ],

  // Email patterns
  email: [
    'email', 'e-mail', 'email_address', 'emailaddress', 'mail', 'correo',
    'email_id', 'emailid', 'useremail', 'user_email', 'work_email',
    'primary_email', 'contact_email', 'email address', 'e-mail address'
  ],

  // Phone patterns
  phone: [
    'phone', 'telephone', 'tel', 'phone_number', 'phonenumber', 'mobile',
    'cell', 'cellphone', 'mobile_phone', 'contact_number', 'primary_phone',
    'phone_num', 'phonenum', 'telefono', 'numero', 'phone number',
    'mobile number', 'contact phone', 'daytime_phone', 'home_phone'
  ],

  // Address patterns
  address: [
    'address', 'street', 'street_address', 'streetaddress', 'address_line',
    'address1', 'address_1', 'street_line', 'mailing_address', 'home_address',
    'direccion', 'street address', 'address line 1', 'address line'
  ],

  // City patterns
  city: [
    'city', 'town', 'locality', 'ciudad', 'ville', 'city_name', 'home_city'
  ],

  // State patterns
  state: [
    'state', 'province', 'region', 'administrative_area', 'estado',
    'provincia', 'state_province', 'state/province'
  ],

  // Zip patterns
  zipCode: [
    'zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'postalcode',
    'post_code', 'postcode', 'pin', 'pincode', 'zip code', 'postal code'
  ],

  // Country patterns
  country: [
    'country', 'nation', 'country_code', 'pais', 'location_country',
    'country_name', 'home_country'
  ],

  // Job Title patterns
  currentJobTitle: [
    'current_title', 'currenttitle', 'job_title', 'jobtitle', 'title',
    'position', 'current_position', 'role', 'current_role', 'designation',
    'headline', 'professional_title', 'occupation', 'job title',
    'current job title', 'current position', 'current title'
  ],

  // Company patterns
  currentCompany: [
    'current_company', 'currentcompany', 'company', 'employer',
    'current_employer', 'organization', 'company_name', 'companyname',
    'employer_name', 'organisation', 'most_recent_company', 'latest_company',
    'current company', 'current employer', 'company name'
  ],

  // LinkedIn patterns
  linkedinUrl: [
    'linkedin', 'linkedin_url', 'linkedinurl', 'linkedin_profile',
    'linkedin_link', 'li_url', 'profile_linkedin', 'social_linkedin',
    'linkedin url', 'linkedin profile'
  ],

  // GitHub patterns
  githubUrl: [
    'github', 'github_url', 'githuburl', 'github_profile', 'github_link',
    'gh_url', 'git_url', 'giturl', 'github url', 'github profile'
  ],

  // Portfolio/Website patterns
  portfolioUrl: [
    'portfolio', 'website', 'portfolio_url', 'personal_website', 'url',
    'homepage', 'personal_url', 'web_url', 'site', 'blog', 'personal site',
    'portfolio url', 'website url', 'personal website'
  ],

  // Work Authorization patterns
  workAuthorization: [
    'work_authorization', 'workauthorization', 'visa', 'visa_status',
    'authorization', 'eligible_to_work', 'sponsorship', 'work_permit',
    'immigration_status', 'require_sponsorship', 'authorized_to_work',
    'work authorization', 'visa status', 'legally authorized'
  ],

  // Relocation patterns
  willingToRelocate: [
    'relocate', 'willing_to_relocate', 'relocation', 'open_to_relocation',
    'can_relocate', 'willing_relocate', 'open_relocation', 'relocation_willing',
    'willing to relocate', 'open to relocation'
  ],

  // Salary patterns
  salaryExpectation: [
    'salary', 'salary_expectation', 'expected_salary', 'compensation',
    'desired_salary', 'pay', 'salary_requirements', 'salary_desired',
    'compensation_expectation', 'salary_range', 'expected compensation',
    'salary expectation', 'desired compensation'
  ],

  // Start Date patterns
  availableStartDate: [
    'start_date', 'startdate', 'available_start', 'availability',
    'available_date', 'earliest_start', 'notice_period', 'when_start',
    'date_available', 'available_from', 'start date', 'available to start'
  ],

  // Degree patterns
  degree: [
    'degree', 'education', 'education_level', 'highest_degree',
    'qualification', 'academic_degree', 'degree_type', 'highest degree',
    'education level'
  ],

  // University patterns
  university: [
    'university', 'school', 'college', 'institution', 'alma_mater',
    'school_name', 'university_name', 'institution_name', 'college_name',
    'school name', 'university name'
  ],

  // Graduation Year patterns
  graduationYear: [
    'graduation_year', 'graduationyear', 'grad_year', 'year_graduated',
    'graduation_date', 'grad_date', 'year_of_graduation', 'graduation',
    'graduation year', 'year graduated'
  ],

  // GPA patterns
  gpa: [
    'gpa', 'grade_point', 'grades', 'cgpa', 'grade', 'grade_average',
    'cumulative_gpa', 'grade point average'
  ],

  // Field of Study patterns
  fieldOfStudy: [
    'field_of_study', 'fieldofstudy', 'major', 'concentration',
    'specialization', 'area_of_study', 'course', 'program', 'discipline',
    'field of study', 'area of study', 'course of study'
  ],

  // Years of Experience patterns
  yearsOfExperience: [
    'years_of_experience', 'yearsofexperience', 'experience',
    'total_experience', 'years_experience', 'work_experience',
    'exp_years', 'professional_experience', 'experience_years',
    'years of experience', 'total years', 'work experience'
  ],

  // Skills patterns
  skills: [
    'skills', 'skill_set', 'skillset', 'technologies', 'competencies',
    'technical_skills', 'abilities', 'expertise', 'qualifications',
    'proficiencies', 'key skills', 'technical skills'
  ],

  // Summary patterns
  summary: [
    'summary', 'about', 'bio', 'about_me', 'professional_summary',
    'objective', 'profile', 'description', 'about_yourself', 'introduction',
    'professional summary', 'about me', 'about yourself', 'cover letter summary'
  ],

  // Cover Letter patterns
  coverLetter: [
    'cover_letter', 'coverletter', 'cover', 'motivation_letter',
    'application_letter', 'letter', 'message', 'why_interested',
    'cover letter', 'motivation letter', 'why are you interested'
  ],
};

// ============================================
// VISIBILITY & VALIDATION HELPERS
// ============================================

/**
 * Check if an element is truly visible and interactable
 * More robust than offsetParent check for modern CSS layouts
 */
function isFieldVisible(element) {
  // Quick null check
  if (!element) return false;

  // Check if element or ancestors are hidden via display/visibility
  const style = getComputedStyle(element);
  if (style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity) === 0) {
    return false;
  }

  // Check dimensions - zero size means not visible
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }

  // Check if element is in viewport or scrollable area
  // Very negative positions usually mean hidden
  if (rect.bottom < -1000 || rect.right < -1000) {
    return false;
  }

  // Walk up the DOM to check for hidden ancestors
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const parentStyle = getComputedStyle(parent);
    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
      return false;
    }
    parent = parent.parentElement;
  }

  return true;
}

/**
 * Check if a field is fillable (not disabled, readonly, or already filled)
 */
function isFieldFillable(element) {
  if (element.disabled) return false;
  if (element.readOnly) return false;
  if (element.getAttribute('aria-disabled') === 'true') return false;
  if (element.getAttribute('aria-readonly') === 'true') return false;
  return true;
}

/**
 * Check if element is a contenteditable element
 */
function isContentEditable(element) {
  return element.getAttribute('contenteditable') === 'true' ||
    element.isContentEditable;
}

/**
 * Get the current value from an element (handles contenteditable)
 */
function getElementValue(element) {
  if (isContentEditable(element)) {
    return element.innerText || element.textContent || '';
  }
  return element.value || '';
}

// ============================================
// TEXT NORMALIZATION
// ============================================

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// FIELD IDENTIFIER EXTRACTION
// ============================================

function getFieldIdentifiers(element) {
  const identifiers = [];

  // Direct attributes
  if (element.name) identifiers.push(element.name);
  if (element.id) identifiers.push(element.id);
  if (element.placeholder) identifiers.push(element.placeholder);
  if (element.getAttribute('aria-label')) identifiers.push(element.getAttribute('aria-label'));
  if (element.getAttribute('aria-labelledby')) {
    const labelId = element.getAttribute('aria-labelledby');
    const labelEl = document.getElementById(labelId);
    if (labelEl) identifiers.push(labelEl.textContent.trim());
  }
  if (element.getAttribute('data-testid')) identifiers.push(element.getAttribute('data-testid'));
  if (element.getAttribute('data-automation-id')) identifiers.push(element.getAttribute('data-automation-id'));
  if (element.getAttribute('data-field-name')) identifiers.push(element.getAttribute('data-field-name'));
  if (element.getAttribute('autocomplete')) identifiers.push(element.getAttribute('autocomplete'));

  // Find label by 'for' attribute
  if (element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label) {
      identifiers.push(label.textContent.trim());
    }
  }

  // Parent label (input inside label)
  const parentLabel = element.closest('label');
  if (parentLabel) {
    // Get label text excluding the input value
    const clone = parentLabel.cloneNode(true);
    clone.querySelectorAll('input, textarea, select').forEach(el => el.remove());
    const text = clone.textContent.trim();
    if (text) identifiers.push(text);
  }

  // Previous sibling label
  let prev = element.previousElementSibling;
  let siblingChecks = 0;
  while (prev && siblingChecks < 3) {
    if (prev.tagName === 'LABEL' ||
      prev.classList.contains('label') ||
      prev.getAttribute('role') === 'label') {
      identifiers.push(prev.textContent.trim());
      break;
    }
    prev = prev.previousElementSibling;
    siblingChecks++;
  }

  // Parent container labels (common in form groups)
  const formGroup = element.closest('[class*="form-group"], [class*="field"], [class*="input-group"], [class*="FormField"], [class*="formField"]');
  if (formGroup) {
    const labels = formGroup.querySelectorAll('label, .label, [class*="label"], legend');
    labels.forEach(lbl => {
      if (lbl !== element && !lbl.contains(element)) {
        const text = lbl.textContent.trim();
        if (text && text.length < 100) identifiers.push(text);
      }
    });
  }

  // Parent's direct label children
  const parent = element.parentElement;
  if (parent) {
    const parentLabels = parent.querySelectorAll(':scope > label, :scope > .label, :scope > span');
    parentLabels.forEach(lbl => {
      if (lbl !== element && !lbl.contains(element)) {
        const text = lbl.textContent.trim();
        if (text && text.length < 100) identifiers.push(text);
      }
    });
  }

  // Grandparent labels (for deeply nested structures)
  const grandparent = parent?.parentElement;
  if (grandparent) {
    const gpLabels = grandparent.querySelectorAll(':scope > label, :scope > .label');
    gpLabels.forEach(lbl => {
      if (!lbl.contains(element)) {
        const text = lbl.textContent.trim();
        if (text && text.length < 100) identifiers.push(text);
      }
    });
  }

  // Deduplicate and filter empty strings
  return [...new Set(identifiers.filter(id => id && id.trim()))];
}

// ============================================
// FIELD MATCHING
// ============================================

function matchFieldToProfile(identifiers, profileMappings) {
  for (const identifier of identifiers) {
    const normalized = normalizeText(identifier);

    // Check each profile field against patterns
    for (const [profileKey, patterns] of Object.entries(FIELD_MAPPINGS)) {
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);

        // Exact match
        if (normalized === normalizedPattern) {
          if (profileMappings[profileKey]) {
            return { key: profileKey, value: profileMappings[profileKey] };
          }
        }

        // Contains match (be careful with short patterns)
        if (normalizedPattern.length >= 3) {
          if (normalized.includes(normalizedPattern) || normalizedPattern.includes(normalized)) {
            if (profileMappings[profileKey]) {
              return { key: profileKey, value: profileMappings[profileKey] };
            }
          }
        }
      }
    }

    // Direct key match in profileMappings
    for (const [key, value] of Object.entries(profileMappings)) {
      const normalizedKey = normalizeText(key);
      if (normalizedKey === normalized ||
        (normalizedKey.length >= 3 && normalized.includes(normalizedKey))) {
        if (value) return { key, value };
      }
    }
  }

  return null;
}

// ============================================
// VALUE SETTING (React/Vue/Angular compatible)
// ============================================

function setFieldValue(element, value) {
  if (!value) return false;

  const tagName = element.tagName.toLowerCase();
  const type = element.type?.toLowerCase() || '';

  // Handle different input types
  if (tagName === 'select') {
    return setSelectValue(element, value);
  } else if (type === 'checkbox') {
    return setCheckboxValue(element, value);
  } else if (type === 'radio') {
    return setRadioValue(element, value);
  } else if (isContentEditable(element)) {
    return setContentEditableValue(element, value);
  } else {
    return setTextValue(element, value);
  }
}

function setTextValue(element, value) {
  try {
    // Focus the element
    element.focus();

    // Native setter for React controlled components
    const nativeSetter = Object.getOwnPropertyDescriptor(
      element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeSetter) {
      nativeSetter.call(element, value);
    } else {
      element.value = value;
    }

    // Dispatch events in order that React/Vue/Angular expect
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    return true;
  } catch (e) {
    console.warn('[Formless] Failed to set text value:', e);
    return false;
  }
}

function setContentEditableValue(element, value) {
  try {
    element.focus();
    element.innerText = value;

    // Dispatch events for contenteditable
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    return true;
  } catch (e) {
    console.warn('[Formless] Failed to set contenteditable value:', e);
    return false;
  }
}

function setSelectValue(element, value) {
  const normalizedValue = normalizeText(String(value));
  const options = Array.from(element.options);

  // Find matching option
  const match = options.find(opt => {
    const optVal = normalizeText(opt.value);
    const optText = normalizeText(opt.text);
    return optVal === normalizedValue ||
      optText === normalizedValue ||
      (normalizedValue.length >= 3 && (optVal.includes(normalizedValue) || optText.includes(normalizedValue))) ||
      (normalizedValue.length >= 3 && (normalizedValue.includes(optVal) || normalizedValue.includes(optText)));
  });

  if (match) {
    element.value = match.value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  return false;
}

function setCheckboxValue(element, value) {
  const shouldCheck = value === true || value === 'true' || value === 'yes' || value === '1' || value === 'Yes';
  if (element.checked !== shouldCheck) {
    element.checked = shouldCheck;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('click', { bubbles: true }));
    return true;
  }
  return false;
}

function setRadioValue(element, value) {
  const normalizedValue = normalizeText(String(value));
  const inputValue = normalizeText(element.value);

  if (normalizedValue === inputValue || inputValue.includes(normalizedValue)) {
    element.checked = true;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('click', { bubbles: true }));
    return true;
  }
  return false;
}

// ============================================
// CORE SCANNING WITH MUTATION OBSERVER
// ============================================

/**
 * Collect all form fields from the current DOM
 */
function collectFields() {
  const elements = document.querySelectorAll(FIELD_SELECTORS);
  const fields = [];
  let index = 0;

  elements.forEach(el => {
    // Skip hidden and disabled fields
    if (!isFieldVisible(el)) return;
    if (!isFieldFillable(el)) return;

    const identifiers = getFieldIdentifiers(el);

    fields.push({
      index: index++,
      element: el,
      tagName: el.tagName.toLowerCase(),
      type: el.type || (isContentEditable(el) ? 'contenteditable' : 'text'),
      name: el.name || '',
      id: el.id || '',
      identifiers,
      hasValue: !!getElementValue(el).trim(),
      placeholder: el.placeholder || el.getAttribute('aria-placeholder') || ''
    });
  });

  return fields;
}

/**
 * Observe DOM for dynamically added fields
 * Returns a Promise that resolves when fields are found or timeout expires
 */
function observeForFields(options = {}) {
  const {
    timeout = CONFIG.SCAN_TIMEOUT_MS,
    minFields = CONFIG.MIN_FIELDS_TO_SUCCEED
  } = options;

  return new Promise((resolve) => {
    let observer = null;
    let timeoutId = null;
    let debounceId = null;
    let resolved = false;

    const cleanup = () => {
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      if (debounceId) clearTimeout(debounceId);
    };

    const tryResolve = () => {
      if (resolved) return;

      const fields = collectFields();
      console.log(`[Formless] Scan found ${fields.length} fields`);

      if (fields.length >= minFields) {
        resolved = true;
        cleanup();
        resolve({ success: true, fields, fieldCount: fields.length });
      }
    };

    // Initial scan
    tryResolve();
    if (resolved) return;

    // Set up MutationObserver for dynamic content
    observer = new MutationObserver((mutations) => {
      // Debounce to avoid excessive scanning during rapid DOM changes
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(tryResolve, CONFIG.MUTATION_DEBOUNCE_MS);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'disabled', 'aria-hidden']
    });

    // Timeout fallback
    timeoutId = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();

      const fields = collectFields();
      console.log(`[Formless] Timeout reached. Found ${fields.length} fields.`);
      resolve({
        success: fields.length > 0,
        fields,
        fieldCount: fields.length,
        timedOut: true
      });
    }, timeout);
  });
}

/**
 * Single scan without observation (for quick operations)
 */
function scanPage() {
  console.log('[Formless] Performing single scan...');
  const fields = collectFields();
  console.log(`[Formless] Found ${fields.length} form fields`);
  return fields;
}

// ============================================
// FORM FILLING
// ============================================

function fillForm(profileData) {
  console.log('[Formless] Starting form fill with profile data...');

  // Build profile mappings from API data
  const profileMappings = {};
  if (profileData.profile) {
    Object.entries(profileData.profile).forEach(([key, value]) => {
      if (value) profileMappings[key] = value;
    });
  }
  if (profileData.fieldMappings) {
    Object.entries(profileData.fieldMappings).forEach(([key, value]) => {
      if (value) profileMappings[key] = value;
    });
  }

  // Also map full name
  if (profileMappings.firstName && profileMappings.lastName) {
    profileMappings.fullName = `${profileMappings.firstName} ${profileMappings.lastName}`;
    profileMappings.name = profileMappings.fullName;
  }

  console.log('[Formless] Profile keys:', Object.keys(profileMappings));

  const fields = scanPage();
  let filledCount = 0;
  let skippedCount = 0;
  const unknownFields = [];

  fields.forEach(field => {
    // Skip if already has value
    if (field.hasValue && getElementValue(field.element).trim() !== '') {
      skippedCount++;
      return;
    }

    const match = matchFieldToProfile(field.identifiers, profileMappings);

    if (match) {
      console.log(`[Formless] Filling: ${field.identifiers[0] || field.name} = ${match.value}`);
      const success = setFieldValue(field.element, match.value);
      if (success) {
        // Visual feedback
        field.element.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
        field.element.style.outline = '2px solid #10b981';
        field.element.style.outlineOffset = '1px';
        filledCount++;

        // Remove visual feedback after a delay
        setTimeout(() => {
          field.element.style.backgroundColor = '';
          field.element.style.outline = '';
          field.element.style.outlineOffset = '';
        }, 2000);
      }
    } else {
      // Track as unknown
      if (field.identifiers.length > 0 || field.name) {
        unknownFields.push({
          fieldName: field.name || field.id || field.identifiers[0] || `field_${field.index}`,
          fieldLabel: field.identifiers[0] || null,
          fieldType: field.type,
          placeholder: field.placeholder,
          pageUrl: window.location.href,
          pageDomain: window.location.hostname
        });
      }
    }
  });

  console.log(`[Formless] Filled: ${filledCount}, Skipped: ${skippedCount}, Unknown: ${unknownFields.length}`);

  return {
    success: true,
    filled: filledCount,
    skipped: skippedCount,
    unknown: unknownFields.length,
    unknownFields
  };
}

// ============================================
// FIELD CAPTURE
// ============================================

function captureFields() {
  const fields = scanPage();
  const captured = [];

  fields.forEach(field => {
    if (field.identifiers.length > 0 || field.name || field.id) {
      captured.push({
        fieldName: field.name || field.id || field.identifiers[0] || `field_${field.index}`,
        fieldLabel: field.identifiers[0] || null,
        fieldType: field.type,
        placeholder: field.placeholder,
        pageUrl: window.location.href,
        pageDomain: window.location.hostname
      });
    }
  });

  return captured;
}

// ============================================
// PAGE INFO
// ============================================

function getPageInfo() {
  const fields = scanPage();
  return {
    url: window.location.href,
    domain: window.location.hostname,
    title: document.title,
    fieldCount: fields.length,
    fields: fields.map(f => ({
      name: f.name || f.id || f.identifiers[0] || 'unknown',
      type: f.type,
      hasValue: f.hasValue
    }))
  };
}

// ============================================
// MESSAGE LISTENER
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Formless] Received message:', message.action);

  switch (message.action) {
    case 'ping':
      sendResponse({ success: true, message: 'Content script ready' });
      break;

    case 'togglePanel':
      toggleFloatingPanel();
      sendResponse({ success: true });
      break;

    case 'scanPage':
      // Use MutationObserver-based scanning for better SPA support
      observeForFields({
        timeout: message.timeout || CONFIG.SCAN_TIMEOUT_MS,
        minFields: 1
      }).then(result => {
        sendResponse({
          success: result.success,
          url: window.location.href,
          domain: window.location.hostname,
          title: document.title,
          fieldCount: result.fieldCount,
          timedOut: result.timedOut || false,
          fields: result.fields.map(f => ({
            name: f.name || f.id || f.identifiers[0] || 'unknown',
            type: f.type,
            hasValue: f.hasValue
          }))
        });
      });
      return true; // Keep channel open for async response

    case 'fillForm':
      const result = fillForm(message.data);
      sendResponse(result);
      break;

    case 'captureFields':
      const captured = captureFields();
      sendResponse({ success: true, fields: captured });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }

  return true; // Keep channel open for async response
});

// ============================================
// FLOATING PANEL - Main UI when icon clicked
// ============================================

const API_BASE = 'http://localhost:3001/api';

/**
 * Create the floating panel UI
 */
function createFloatingPanel() {
  if (document.getElementById('formless-panel')) {
    return document.getElementById('formless-panel');
  }

  const panel = document.createElement('div');
  panel.id = 'formless-panel';
  panel.innerHTML = `
    <div id="formless-panel-header">
      <div id="formless-panel-logo">
        <svg viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span id="formless-panel-title">Formless</span>
      </div>
      <button id="formless-panel-close">
        <svg viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="formless-panel-body">
      <!-- Login Section (shown when not logged in) -->
      <div id="formless-panel-login">
        <input type="email" class="formless-input" id="formless-email" placeholder="Email" autocomplete="email">
        <input type="password" class="formless-input" id="formless-password" placeholder="Password" autocomplete="current-password">
        <div class="formless-error" id="formless-login-error"></div>
        <button class="formless-btn formless-btn-primary" id="formless-login-btn">
          <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          Sign In
        </button>
      </div>
      
      <!-- Main Section (shown when logged in) -->
      <div id="formless-panel-main" style="display: none;">
        <div id="formless-panel-user">
          <div id="formless-panel-user-avatar">U</div>
          <div id="formless-panel-user-info">
            <div id="formless-panel-user-email">user@example.com</div>
          </div>
          <button id="formless-panel-logout">Logout</button>
        </div>
        
        <div id="formless-panel-status">
          <div id="formless-panel-status-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div id="formless-panel-status-text">
            <div id="formless-panel-status-title">Ready to scan</div>
            <div id="formless-panel-status-desc">Click the button below to fill this form</div>
          </div>
        </div>
        
        <div id="formless-panel-stats" style="display: none;">
          <div class="formless-stat">
            <div class="formless-stat-value" id="formless-stat-filled">0</div>
            <div class="formless-stat-label">Filled</div>
          </div>
          <div class="formless-stat">
            <div class="formless-stat-value" id="formless-stat-skipped">0</div>
            <div class="formless-stat-label">Skipped</div>
          </div>
          <div class="formless-stat">
            <div class="formless-stat-value" id="formless-stat-unknown">0</div>
            <div class="formless-stat-label">Unknown</div>
          </div>
        </div>
        
        <div id="formless-panel-actions">
          <button class="formless-btn formless-btn-primary" id="formless-fill-btn">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Fill This Form
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Add event listeners
  document.getElementById('formless-panel-close').addEventListener('click', () => {
    panel.classList.remove('visible');
  });

  document.getElementById('formless-login-btn').addEventListener('click', handlePanelLogin);
  document.getElementById('formless-panel-logout').addEventListener('click', handlePanelLogout);
  document.getElementById('formless-fill-btn').addEventListener('click', handlePanelFill);

  // Enter key for login
  document.getElementById('formless-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handlePanelLogin();
  });

  return panel;
}

/**
 * Toggle the floating panel visibility
 */
async function toggleFloatingPanel() {
  let panel = document.getElementById('formless-panel');

  if (!panel) {
    panel = createFloatingPanel();
  }

  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  } else {
    panel.classList.add('visible');
    // Check auth state
    await checkPanelAuthState();
  }
}

/**
 * Check if user is logged in and update panel UI
 */
async function checkPanelAuthState() {
  const { token, email } = await chrome.storage.local.get(['token', 'email']);

  const loginSection = document.getElementById('formless-panel-login');
  const mainSection = document.getElementById('formless-panel-main');
  const userEmail = document.getElementById('formless-panel-user-email');
  const userAvatar = document.getElementById('formless-panel-user-avatar');

  if (token && email) {
    loginSection.style.display = 'none';
    mainSection.style.display = 'flex';
    mainSection.style.flexDirection = 'column';
    mainSection.style.gap = '16px';
    userEmail.textContent = email;
    userAvatar.textContent = email.charAt(0).toUpperCase();
  } else {
    loginSection.style.display = 'flex';
    loginSection.style.flexDirection = 'column';
    loginSection.style.gap = '12px';
    mainSection.style.display = 'none';
  }
}

/**
 * Make API request through background script (bypasses CSP)
 */
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'apiRequest',
      endpoint,
      method,
      body,
      token
    }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response && response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response?.error || 'Request failed'));
      }
    });
  });
}

/**
 * Handle login from panel
 */
async function handlePanelLogin() {
  const emailInput = document.getElementById('formless-email');
  const passwordInput = document.getElementById('formless-password');
  const loginBtn = document.getElementById('formless-login-btn');
  const errorDiv = document.getElementById('formless-login-error');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    errorDiv.textContent = 'Please fill in all fields';
    errorDiv.classList.add('visible');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.innerHTML = '<div class="formless-spinner"></div> Signing in...';
  errorDiv.classList.remove('visible');

  try {
    const data = await apiRequest('/auth/login', 'POST', { email, password });

    await chrome.storage.local.set({
      token: data.token,
      email: data.user.email
    });

    emailInput.value = '';
    passwordInput.value = '';
    await checkPanelAuthState();

  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('visible');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> Sign In';
  }
}


/**
 * Handle logout from panel
 */
async function handlePanelLogout() {
  await chrome.storage.local.remove(['token', 'email']);
  await checkPanelAuthState();
}

/**
 * Handle fill button click from panel
 */
async function handlePanelFill() {
  const fillBtn = document.getElementById('formless-fill-btn');
  const statusIcon = document.getElementById('formless-panel-status-icon');
  const statusTitle = document.getElementById('formless-panel-status-title');
  const statusDesc = document.getElementById('formless-panel-status-desc');
  const statsDiv = document.getElementById('formless-panel-stats');

  fillBtn.disabled = true;
  fillBtn.innerHTML = '<div class="formless-spinner"></div> Filling...';
  statusIcon.classList.add('scanning');
  statusTitle.textContent = 'Scanning...';
  statusDesc.textContent = 'Looking for form fields';

  try {
    const { token } = await chrome.storage.local.get(['token']);

    if (!token) {
      throw new Error('Please sign in first');
    }

    // Fetch profile via background proxy
    let profileData;
    try {
      profileData = await apiRequest('/profile/fill', 'GET', null, token);
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('unauthorized')) {
        await chrome.storage.local.remove(['token', 'email']);
        await checkPanelAuthState();
        throw new Error('Session expired. Please sign in again');
      }
      throw new Error('Failed to load profile');
    }

    // Get domain mappings
    let domainMappings = {};
    try {
      const domainData = await apiRequest(`/unknown-fields/domain/${encodeURIComponent(window.location.hostname)}`, 'GET', null, token);
      domainMappings = domainData.fieldMappings || {};
    } catch (e) { }

    // Fill form
    const allData = {
      profile: profileData.profile || {},
      fieldMappings: { ...profileData.fieldMappings, ...domainMappings }
    };

    const result = fillForm(allData);

    // Update UI
    statusIcon.classList.remove('scanning');

    if (result.filled > 0) {
      statusIcon.classList.add('success');
      statusIcon.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      statusTitle.textContent = 'Form filled!';
      statusDesc.textContent = `Successfully filled ${result.filled} field${result.filled > 1 ? 's' : ''}`;

      statsDiv.style.display = 'grid';
      document.getElementById('formless-stat-filled').textContent = result.filled;
      document.getElementById('formless-stat-skipped').textContent = result.skipped || 0;
      document.getElementById('formless-stat-unknown').textContent = result.unknown || 0;

      // Save unknown fields via background proxy
      if (result.unknownFields && result.unknownFields.length > 0) {
        try {
          await apiRequest('/unknown-fields', 'POST', result.unknownFields, token);
        } catch (e) { }
      }
    } else {
      statusIcon.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      statusTitle.textContent = 'No fields filled';
      statusDesc.textContent = 'No matching form fields found on this page';
    }

  } catch (error) {
    statusIcon.classList.remove('scanning');
    statusIcon.classList.add('error');
    statusIcon.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    statusTitle.textContent = 'Error';
    statusDesc.textContent = error.message;
  } finally {
    fillBtn.disabled = false;
    fillBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Fill This Form';
  }
}



// ============================================
// FLOATING WIDGET - Auto-appears on job portals
// ============================================

// Job portal domain patterns
const JOB_PORTAL_PATTERNS = [
  // Major job boards
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'monster.com',
  'ziprecruiter.com',
  'careerbuilder.com',
  'dice.com',
  'simplyhired.com',

  // ATS systems
  'greenhouse.io',
  'lever.co',
  'workday.com',
  'myworkdayjobs.com',
  'icims.com',
  'smartrecruiters.com',
  'jobvite.com',
  'breezy.hr',
  'ashbyhq.com',
  'bamboohr.com',
  'recruitee.com',
  'workable.com',
  'jazz.co',
  'jazzhr.com',
  'freshteam.com',
  'zoho.com/recruit',
  'applytojob.com',
  'taleo.net',
  'successfactors.com',
  'ultipro.com',
  'adp.com',

  // Company career pages patterns
  'careers.',
  'jobs.',
  '/careers',
  '/jobs',
  '/apply',
  '/job-application',
  '/application',

  // Startup job boards
  'angel.co',
  'wellfound.com',
  'ycombinator.com/jobs',
  'workatastartup.com',

  // Tech-specific
  'hired.com',
  'triplebyte.com',
  'hackerrank.com',
  'codility.com'
];

/**
 * Check if current page is a job portal
 */
function isJobPortal() {
  const url = window.location.href.toLowerCase();
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  return JOB_PORTAL_PATTERNS.some(pattern => {
    if (pattern.startsWith('/')) {
      return pathname.includes(pattern);
    }
    return hostname.includes(pattern) || url.includes(pattern);
  });
}

/**
 * Check if page has form fields (quick check)
 */
function hasFormFields() {
  const elements = document.querySelectorAll(FIELD_SELECTORS);
  let count = 0;
  for (const el of elements) {
    if (isFieldVisible(el) && isFieldFillable(el)) {
      count++;
      if (count >= 2) return true; // At least 2 fields suggests a form
    }
  }
  return count >= 2;
}

/**
 * Create the floating widget
 */
function createFloatingWidget() {
  // Check if widget already exists
  if (document.getElementById('formless-floating-widget')) {
    return document.getElementById('formless-floating-widget');
  }

  // Create widget container
  const widget = document.createElement('div');
  widget.id = 'formless-floating-widget';

  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'formless-tooltip';
  tooltip.textContent = 'Click to auto-fill this form';

  // Create FAB button
  const fab = document.createElement('button');
  fab.id = 'formless-fab';
  fab.title = 'Formless - Auto-fill form';
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `;

  // Create badge for field count
  const badge = document.createElement('div');
  badge.id = 'formless-badge';
  badge.style.display = 'none';
  fab.appendChild(badge);

  widget.appendChild(tooltip);
  widget.appendChild(fab);
  document.body.appendChild(widget);

  // Add click handler
  fab.addEventListener('click', handleWidgetClick);

  // Show tooltip on hover
  fab.addEventListener('mouseenter', () => {
    tooltip.classList.add('visible');
  });

  fab.addEventListener('mouseleave', () => {
    if (!tooltip.classList.contains('success') && !tooltip.classList.contains('error')) {
      tooltip.classList.remove('visible');
    }
  });

  return widget;
}

/**
 * Handle widget click - scan and fill
 */
async function handleWidgetClick() {
  const fab = document.getElementById('formless-fab');
  const tooltip = document.getElementById('formless-tooltip');
  const badge = document.getElementById('formless-badge');

  if (!fab || fab.classList.contains('loading')) return;

  // Set loading state
  fab.classList.add('loading');
  fab.classList.remove('success', 'error');
  tooltip.classList.remove('success', 'error');
  tooltip.textContent = 'Scanning for fields...';
  tooltip.classList.add('visible');

  // Change icon to spinner
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
    </svg>
  `;

  try {
    // First, get auth token
    const storage = await chrome.storage.local.get(['token', 'email']);

    if (!storage.token) {
      throw new Error('Please sign in via the extension panel first');
    }

    // Fetch profile data via background proxy
    let profileData;
    try {
      profileData = await apiRequest('/profile/fill', 'GET', null, storage.token);
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('unauthorized')) {
        throw new Error('Session expired. Please sign in again');
      }
      throw new Error('Failed to load profile data');
    }

    // Get domain-specific mappings via background proxy
    let domainMappings = {};
    try {
      const domainData = await apiRequest(`/unknown-fields/domain/${encodeURIComponent(window.location.hostname)}`, 'GET', null, storage.token);
      domainMappings = domainData.fieldMappings || {};
    } catch (e) {
      console.log('[Formless] No domain-specific mappings');
    }

    // Merge all data
    const allData = {
      profile: profileData.profile || {},
      fieldMappings: { ...profileData.fieldMappings, ...domainMappings }
    };

    // Fill the form
    const result = fillForm(allData);

    // Update UI based on result
    fab.classList.remove('loading');

    if (result.filled > 0) {
      fab.classList.add('success');
      tooltip.classList.add('success');
      tooltip.textContent = `✓ Filled ${result.filled} field${result.filled > 1 ? 's' : ''}!`;
      badge.textContent = result.filled;
      badge.style.display = 'flex';

      // Reset icon to checkmark
      fab.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      // Save unknown fields via background proxy
      if (result.unknownFields && result.unknownFields.length > 0) {
        try {
          await apiRequest('/unknown-fields', 'POST', result.unknownFields, storage.token);
        } catch (e) {
          console.log('[Formless] Failed to save unknown fields');
        }
      }
    } else {
      tooltip.textContent = 'No matching fields found';
      resetFabIcon();
    }

    // Hide tooltip after delay
    setTimeout(() => {
      tooltip.classList.remove('visible', 'success', 'error');
      fab.classList.remove('success');
    }, 3000);

  } catch (error) {
    console.error('[Formless] Widget error:', error);
    fab.classList.remove('loading');
    fab.classList.add('error');
    tooltip.classList.add('error', 'visible');
    tooltip.textContent = error.message || 'Failed to fill form';
    resetFabIcon();

    setTimeout(() => {
      tooltip.classList.remove('visible', 'error');
      fab.classList.remove('error');
    }, 4000);
  }
}


/**
 * Reset FAB icon to default
 */
function resetFabIcon() {
  const fab = document.getElementById('formless-fab');
  if (!fab) return;

  const badge = fab.querySelector('#formless-badge');
  const badgeHTML = badge ? badge.outerHTML : '<div id="formless-badge" style="display:none"></div>';

  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    ${badgeHTML}
  `;
}

/**
 * Show/hide widget based on page context
 */
function updateWidgetVisibility() {
  const widget = document.getElementById('formless-floating-widget');
  if (!widget) return;

  const shouldShow = isJobPortal() || hasFormFields();

  if (shouldShow) {
    widget.classList.add('visible');
    console.log('[Formless] Widget shown - job portal or form detected');
  } else {
    widget.classList.remove('visible');
  }
}

/**
 * Initialize widget with delay to let page load
 */
function initializeWidget() {
  // Wait a bit for SPAs to render
  setTimeout(() => {
    createFloatingWidget();
    updateWidgetVisibility();

    // Re-check visibility when DOM changes significantly
    let visibilityCheckTimeout = null;
    const visibilityObserver = new MutationObserver(() => {
      if (visibilityCheckTimeout) clearTimeout(visibilityCheckTimeout);
      visibilityCheckTimeout = setTimeout(updateWidgetVisibility, 500);
    });

    visibilityObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

  }, 1000);
}

// ============================================
// AUTO-ANNOUNCE & INITIALIZE
// ============================================
console.log('[Formless] Content script ready and listening');

// Initialize floating widget
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
}
