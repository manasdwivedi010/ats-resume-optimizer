# 🎯 Role-Based ATS Resume Reader & Optimizer (MongoDB Edition)

> **Built by Manas Dwivedi** • AI-Powered ATS Resume Builder & Optimizer benchmarked against the strict **90% ATS Threshold Rule**.

An enterprise-ready Applicant Tracking System (ATS) optimization platform tailored to evaluate resumes against target job roles and descriptions. When a resume score falls below **90%**, it pinpoints structural, keyword, and content flaws, while recommending missing skills, action verbs, and tailored rewrites to help candidates reach a 90%+ match score.

Includes an **AI Resume Maker / 90%+ Builder** that exports print-accurate A4 PDFs with **100% active, clickable hyperlinks**, a **passwordless Email OTP verification system** via Gmail SMTP, and complete **Dark / Light Mode**.

---

## ✨ Key Features

- ⚡ **90% ATS Threshold Engine**: Weighted 5-pillar scoring algorithm (Hard Skills 40%, Experience 25%, Action Verbs/Metrics 15%, Soft Skills 10%, Formatting 10%).
- 🛠️ **AI Resume Maker (90%+ Builder)**:
  - Zero fabricated data: you control 100% of your resume details (Work Experience, Education, Projects, Summary).
  - Only suggests and injects the exact missing required skills needed to cross the 90% threshold.
  - **Dynamic Portfolios & Custom Links**: Add unlimited links/websites (GitHub, LinkedIn, LeetCode, Personal Portfolios).
  - **Clickable PDF Export**: Generates clean, publication-ready A4 resumes where **all links, emails (`mailto:`), phone numbers (`tel:`), and project URLs are clickable** in the downloaded PDF.
- 🌓 **Dark / Light Mode**: Seamless theme switching with localStorage persistence and OS system preference sync.
- 🔐 **Passwordless Email OTP Authentication**: Delivers real 6-digit one-time passcodes to user emails via Gmail SMTP, backed by JWT sessions.
- 🗄️ **MongoDB Persistence**: Stores scan trees, diagnostics, and user history (with in-memory fallback if MongoDB is not locally running).

---

## 📂 Project Architecture & Directory Structure

```text
ats-resume-optimizer/
├── .gitignore                           # Excludes credentials (.env), node_modules, and venv
├── README.md                            # Complete setup guide, architecture, and documentation
│
├── backend/                             # FastAPI Python 3.10+ Backend
│   ├── .env.example                     # Environment variables template for MongoDB and Gmail SMTP
│   ├── requirements.txt                 # Backend Python package dependencies
│   ├── test_gmail_smtp.py               # Standalone diagnostic utility for Gmail SMTP connection
│   │
│   ├── app/
│   │   ├── main.py                      # FastAPI application entry point, CORS, and router registration
│   │   │
│   │   ├── api/                         # API endpoints
│   │   │   ├── ats.py                   # ATS evaluation, scoring, role list, and MongoDB scan persistence
│   │   │   ├── auth.py                  # Passwordless email OTP generation, verification, and JWT issuance
│   │   │   └── deps.py                  # Authentication dependencies and JWT token validation
│   │   │
│   │   ├── core/                        # Core configuration and security
│   │   │   ├── config.py                # Environment settings management (Pydantic BaseSettings)
│   │   │   └── security.py              # JWT token generation and passwordless passcode logic
│   │   │
│   │   ├── db/                          # Database connection and models
│   │   │   └── mongodb.py               # Motor MongoDB client with in-memory fallback store
│   │   │
│   │   └── services/                    # Business and evaluation logic
│   │       ├── ats_service.py           # 5-pillar ATS scoring algorithm (90% threshold rule)
│   │       ├── email_service.py         # Async Gmail SMTP email dispatcher for OTP codes
│   │       └── parser_service.py        # PDF & DOCX text, contact, and section extraction
│   │
│   └── tests/                           # Automated test suite
│       ├── test_ats_engine.py           # Unit tests for scoring, flaw detection, and recommendations
│       └── test_api_integration.py      # Integration tests for auth, OTP, and file scan endpoints
│
└── frontend/                            # React 19 + Vite + Tailwind CSS Frontend
    ├── package.json                     # Frontend dependencies and npm scripts
    ├── vite.config.js                   # Vite bundler configuration
    ├── index.html                       # HTML root with ATS branding and favicon
    │
    ├── public/
    │   ├── ats-logo.png                 # Stylized ATS branding logo
    │   ├── favicon.svg                  # Browser tab icon
    │   └── icons.svg                    # SVG sprite icons
    │
    └── src/
        ├── App.jsx                      # Root application component with view routing and dark mode
        ├── App.css                      # Global component styles
        ├── index.css                    # Tailwind CSS setup and dark mode theme definitions
        ├── main.jsx                     # React DOM initialization
        │
        ├── components/                  # UI Components
        │   ├── Navbar.jsx               # Header with logo, developer credit, AI Tools, and Dark/Light toggle
        │   ├── HeroPreview.jsx          # SaaS hero preview matching PikaResume layout
        │   ├── FileUpload.jsx           # Drag-and-drop resume uploader with target role selector
        │   ├── ScoreGauge.jsx           # Circular score gauge with 90% threshold indicator and breakdown
        │   ├── FlawCards.jsx            # Actionable diagnostics for flaws, missing skills, and rewrites
        │   ├── ResumeMaker.jsx          # AI Resume Builder with clickable links, active preview, and PDF export
        │   ├── HistoryList.jsx          # User's saved resume scan history and past scores
        │   └── LoginOTP.jsx             # Passwordless Email OTP modal with auto-fill test button
        │
        └── services/
            └── api.js                   # Axios HTTP client with JWT interceptor and API methods
```

---

## 💻 System Prerequisites

Before running the application on any system (Windows, macOS, Linux):
1. **Node.js** (v18.0.0 or newer) & **npm**
2. **Python** (v3.10 or newer)
3. *(Optional)* **MongoDB** (v5.0+ or MongoDB Atlas connection string; fallback store is included if absent)

---

## 🛠️ Installation & Setup (Step-by-Step)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd ats-resume-optimizer
```

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to configure your Gmail SMTP credentials or MongoDB URI:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=ats_optimizer

   JWT_SECRET=your-secret-key-change-in-production
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   OTP_EXPIRE_MINUTES=5

   # Set to false to send real emails via Gmail SMTP, or true for console auto-fill
   OTP_DEV_MODE=false

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_digit_app_password
   SMTP_FROM=your_email@gmail.com
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs will be live at: `http://localhost:8000/docs`

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:5173
   ```

---

## 📊 The 90% ATS Scoring Rubric

| Component | Max Points | What is Evaluated |
| :--- | :--- | :--- |
| **Hard Skills & Keywords** | 40 pts | Matches exact technical tools, frameworks, and role requirements |
| **Experience & Alignment** | 25 pts | Role title relevance, seniority duration, and chronological depth |
| **Action Verbs & Metrics** | 15 pts | High-impact verbs (*Architected, Automated*) & quantified achievements (*45%, 150k+ users*) |
| **Soft Skills** | 10 pts | Cross-functional collaboration, Agile, communication, and leadership |
| **Formatting & Readability** | 10 pts | Standard headers (*Experience, Skills, Education*), bullet point layout, contact info |

---

## 🧪 Running Automated Tests

```bash
cd backend
pytest tests
```

---

## 👨‍💻 Developer & Author

- **Developer:** Manas Dwivedi
- **Email:** `dubeymanas618@gmail.com`
- **GitHub:** `github.com/manasdwivedi010`
- **LinkedIn:** `linkedin.com/in/manas-dwivedi-a374b5247`

---

## 📄 License
This project is licensed under the MIT License.
