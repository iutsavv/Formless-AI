# 🚀 Formless - Job Application Auto-Fill Extension

A complete system to automatically fill job application forms with your saved profile data. Includes a Chrome extension, React dashboard, and Express backend.

![Formless Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🔌 Chrome Extension
- **One-Click Fill**: Auto-fill job application forms instantly
- **Smart Detection**: Recognizes 100+ common form field patterns
- **Unknown Field Capture**: Saves unrecognized fields for later

### 📝 React Dashboard
- **Profile Management**: Store all your job application details
- **Resume Upload**: Auto-extract data from PDF/DOC resumes
- **Unknown Fields**: View and fill captured fields from job sites
- **Modern UI**: Dark theme with glassmorphism design

### 🔧 Backend API
- **JWT Authentication**: Secure login/registration
- **Profile Storage**: All job application fields
- **Resume Parsing**: PDF text extraction with smart field detection
- **Unknown Fields API**: Capture and manage new form fields

---

## 📁 Project Structure

```
├── backend/                    # Express + TypeScript API
│   ├── prisma/schema.prisma   # Database schema
│   ├── src/
│   │   ├── controllers/       # Auth, Profile, Resume, UnknownFields
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # JWT authentication
│   │   └── index.ts           # Server entry
│   └── .env                   # Environment config
│
├── frontend/                   # React + Vite Dashboard
│   ├── src/
│   │   ├── pages/             # Login, Register, Onboarding, Profile
│   │   ├── components/        # Navbar, PrivateRoute
│   │   ├── context/           # AuthContext
│   │   └── api/               # API client
│   └── index.html
│
└── extension/                  # Chrome Extension (Manifest V3)
    ├── manifest.json
    ├── popup/                  # Extension popup UI
    ├── content/                # Form detection script
    └── background/             # Service worker
```

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Chrome browser

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Edit backend/.env with your PostgreSQL connection
DATABASE_URL="postgresql://user:password@localhost:5432/job_autofill"

# Create database tables
cd backend
npx prisma db push
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### 4. Load Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## 🎯 How It Works

### User Flow

1. **Register/Login** → Create account on dashboard
2. **Upload Resume** → Auto-extract profile data from PDF
3. **Try Demo** → Interactive form shows how auto-fill works
4. **Go to Dashboard** → View/edit all saved fields
5. **Use Extension** → Fill real job forms with one click

### Extension Flow

```
User clicks "Fill This Page"
        ↓
Extension fetches profile data from API
        ↓
Content script scans page for form fields
        ↓
Smart matching finds corresponding values
        ↓
Form fields are filled automatically
        ↓
Unknown fields are captured and saved
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/profile/fill` | Get profile with field mappings |
| POST | `/api/resume/parse` | Upload & parse resume |
| GET | `/api/unknown-fields` | Get all unknown fields |
| POST | `/api/unknown-fields` | Capture new fields |
| PUT | `/api/unknown-fields/:id` | Update field value |
| DELETE | `/api/unknown-fields/:id` | Delete field |

---

## 🗄️ Database Schema

### User
- `id`, `email`, `password`, `createdAt`, `updatedAt`

### Profile (30+ fields)
- Personal: firstName, lastName, email, phone, address, city, state, zip, country
- Professional: jobTitle, company, linkedinUrl, githubUrl, portfolioUrl
- Work: authorization, relocate, salary, startDate
- Education: degree, university, graduationYear, gpa, fieldOfStudy
- Experience: yearsOfExperience, skills, summary, coverLetter

### UnknownField
- `fieldName`, `fieldLabel`, `fieldType`, `pageUrl`, `pageDomain`, `userValue`

---

## 🔍 Field Detection

The extension uses multiple matching strategies:

1. **Direct Match**: Exact field name/id match
2. **Normalized Match**: Lowercase, no special chars
3. **Pattern Match**: 100+ common job form patterns
4. **Word Match**: Partial word matching

### Supported Field Types
- Input (text, email, tel, url, number)
- Textarea
- Select dropdowns
- Checkboxes
- Radio buttons

---

## 🎨 Tech Stack

| Component | Technologies |
|-----------|-------------|
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT |
| Frontend | React, Vite, TypeScript, React Router, React Hot Toast |
| Extension | Chrome Manifest V3, JavaScript |
| Styling | CSS Variables, Glassmorphism, Dark Theme |

---

## 📝 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/job_autofill"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
```

---

## 🚧 Roadmap

- [ ] Firefox extension support
- [ ] Resume file storage (S3/CloudFlare)
- [ ] Multiple profile templates
- [ ] Field value autocomplete suggestions
- [ ] Analytics dashboard
- [ ] Team/organization accounts

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

Made with ❤️ for job seekers everywhere
