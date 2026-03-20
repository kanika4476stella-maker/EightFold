# 🔭 TalentScope — Internal Talent Liquidity Agent

> **Eightfold Hackathon 2026** | Impact Area 03: Internal Talent Liquidity

An AI-powered internal talent discovery platform that maps your workforce skills, surfaces the best internal candidates for any open role, and generates concrete upskilling roadmaps — all running entirely in the browser.

---

## 🚀 Quick Start

1. **Open `index.html`** in any modern browser (Chrome, Edge, Firefox)
2. Click **"✨ Load 15 Sample Employees"** — or upload your own CSV/JSON file
3. A job description is pre-filled (Senior Data Engineer) — or pick another preset / paste your own
4. Click **"🔍 Analyze Workforce"**
5. Browse ranked candidates, view gap analysis, and explore upskilling roadmaps

> ⚠️ Because the app fetches local files (demo data), open it via a local server or browser's file:// protocol. If demo data doesn't load, just upload the files from `data/` manually.

---

## 📁 Project Structure

```
eightfold hackathon/
├── index.html               ← Landing + upload page
├── results.html             ← Analysis results page
├── styles/
│   └── global.css           ← Design system (dark glassmorphism)
├── js/
│   ├── parser.js            ← CSV + JSON profile parser
│   ├── engine.js            ← Matching, gap analysis, roadmap engine
│   ├── gap_dna.js           ← ✨ NEW: AI Learning DNA generator
│   ├── data.js              ← Bundled demo data (CORS-safe)
│   ├── app.js               ← Landing page controller
│   └── results.js           ← Results page controller
├── data/
│   ├── sample_employees.csv ← 15 sample employee profiles (CSV)
│   ├── sample_employees.json← 15 sample employee profiles (JSON)
│   └── sample_jobs.json     ← 3 sample job descriptions
└── serve.js                 ← Simple Node.js local server
```

---

## 📋 Employee Profile Format

### CSV (columns in this order):
```
id, name, title, department, experience_years, skills, certifications, education
```
- `skills` and `certifications` should be quoted comma-separated lists: `"Python,SQL,Spark"`

### JSON:
```json
[
  {
    "id": "EMP001",
    "name": "Aanya Sharma",
    "title": "Data Analyst",
    "department": "Analytics",
    "experience_years": 5,
    "skills": ["Python", "SQL", "Tableau"],
    "certifications": ["Google Data Analytics"],
    "education": "B.Tech Computer Science"
  }
]
```

---

## 🤖 Matching Algorithm

The engine scores each employee against the job description using a **weighted multi-factor model**:

| Factor | Weight | Description |
|--------|--------|-------------|
| Required skill match | **60%** | Fraction of required skills the employee has |
| Nice-to-have match | **20%** | Fraction of nice-to-have skills matched |
| Experience proximity | **15%** | Years of experience vs. minimum required |
| Title/domain affinity | **5%** | Similarity between employee role and job title |

**Score range: 0–100**. Results are sorted highest to lowest.

---

## 📊 Gap Analysis

For each candidate, the engine generates:
- ✅ **Matched Required Skills** — skills the candidate already has
- 🔴 **Critical Gaps** — required skills the candidate is missing
- 🟡 **Minor Gaps** — nice-to-have skills the candidate is missing
- ⏳ **Experience Gap** — years short of the minimum requirement
- **Gap Severity**: Low / Medium / High

---

## 🛤️ Upskilling Roadmap

For each skill gap, the engine generates:
- **Curated course recommendations** (Coursera, Databricks, AWS Training, Udemy, etc.)
- **Priority ordering** — critical gaps addressed first
- **Time estimates** — weeks to close each gap
- **Skill level** — Beginner / Intermediate / Advanced
- **Readiness estimate** — total weeks to be ready for the role

---

## 🧬 AI Learning DNA (Detailed Roadmaps)

Beyond simple course lists, TalentScope generates a **Personalised AI Learning DNA**:
- **30-Day Foundation Phase**: Intensive focus on the primary skill gap.
- **90-Day Advanced Phase**: Production-level application and specialization.
- **Checkable Milestones**: Specific weekly deliverables (scrapers, APIs, warehouses) for manager review.
- **Bridge-based Learning**: Uses existing skills (e.g., Python) as a bridge to new frameworks (e.g., Airflow).
- **Success Metrics**: Specific outcome-based signals that prove the employee is "Ready Now."

---

## 🔧 Filters & Controls

On the results page you can filter by:
- **Min. Match Score** — slider from 0–100%
- **Department** — show/hide specific departments
- **Gap Severity** — Low / Medium / High
- **Sort** — by Score, Experience, Fewest Gaps, or Fastest Readiness
- **"Ready Now Only"** — show only candidates with no critical gaps

---

## 🏗️ Tech Stack

- **Pure HTML, CSS, JavaScript** — no frameworks, no build step, no backend
- **Google Fonts** (Inter) — typography
- **CSS custom properties + animations** — design system
- **sessionStorage** — data handoff between pages

---

---

## ✅ Project Status
- **Core Engine**: Fully implemented and verified.
- **Data Model**: Compatible with CSV/JSON workforce exports.
- **UI/UX**: Production-ready dark mode design with responsive layout.
- **Verification**: 100% success across all feature targets.

*Built with ❤️ for the Eightfold Hackathon 2026*
