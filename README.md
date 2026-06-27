# SpendLens - Personal Finance Analyzer

SpendLens is a smart personal finance and banking transaction analyzer. It parses uploaded bank statements (supporting CSV, PDF, and JSON), automatically classifies transactions into banking channels using a Machine Learning classification engine, flags abnormal monthly spending spikes, and compiles downloadable PDF reports with computed financial insights.

---

## 🚀 Key Features

* **Secure Authentication**: User registration and login utilizing encrypted password hashing (`bcrypt`) and JWT (JSON Web Tokens) session verification.
* **Auto-Categorization (ML)**: A Multinomial Naive Bayes classifier trained on banking transactions using TF-IDF vectorization to automatically classify transaction details.
* **Aggregated Anomaly Detection**: A rolling analysis script that compares monthly category spends against a 3-month rolling average, flagging category-months exceeding a `2.0` ratio.
* **Analytics Dashboard APIs**: Aggregations for total spent, largest spending category, category-wise progress trackers, and monthly trend metrics.
* **Monthly Compiled Reports**: High-quality downloadable PDF compilations of cashflow summaries, top expenses, flagged anomalies, and calculated insights.

---

## 🛠️ Technology Stack

* **API Framework**: FastAPI (Asynchronous Python)
* **Web Server**: Uvicorn (ASGI)
* **Database & Persistence**: SQLite (Development) / PostgreSQL (Production) mapped via SQLAlchemy ORM
* **Data Science & ML**: Pandas, NumPy, Scikit-Learn
* **PDF Engine**: FPDF2
* **Token Security**: PyJWT & Cryptography

---

## 📂 Repository Directory Layout

```
SpendLens/
├── ML_spendlens/            # Machine Learning workspace
│   ├── data/                # Raw bank statements & analysis files
│   ├── models/              # Exported model.pkl & vectorizer.pkl files
│   ├── reports/             # ML training & performance reports
│   └── src/                 # Text preprocessing & classifier training scripts
├── backend/                 # FastAPI backend server
│   ├── app/
│   │   ├── main.py          # App initialization, lifespan events, & routing
│   │   ├── database.py      # SQLAlchemy connection & session providers
│   │   ├── models.py        # Relational schema tables (User, Transaction, etc.)
│   │   ├── schemas.py       # Pydantic schemas for request/response serialization
│   │   ├── auth.py          # Session security & JWT decoding dependency
│   │   ├── routers/         # Auth, Upload, Transaction, Analytics, & Report endpoints
│   │   └── services/        # Clean statement parsers, ML loader, & PDF compiler
│   ├── tests/
│   │   └── test_api.py      # Integration testing client suite
│   ├── seed.py              # Pre-seeds categories for ML classes compatibility
│   └── requirements.txt     # Python backend packages list
├── transactions.json        # 4,900+ rows sample statements dataset
└── .gitignore
```

---

## ⚙️ Local Development Setup

### Prerequisite
* Python 3.12+ (Python 3.13.5 fully supported)

### 1. Configure the Virtual Environment
Navigate to the `backend/` directory, create a virtual environment, and install dependencies:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory (see [.env.example](file:///c:/Users/rajpa/OneDrive/Desktop/SpendLens/backend/.env.example) for reference):
```ini
DATABASE_URL=sqlite:///./spendlens.db
JWT_SECRET_KEY=your_secure_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. Initialize & Seed Database
Initialize schemas and seed standard transaction categories (matching the ML model target classes):
```powershell
python seed.py
```

### 4. Boot the Server
Run the local uvicorn ASGI web server:
```powershell
uvicorn app.main:app --reload
```
Once running, open your browser and navigate to:
* **Interactive API Documentation (Swagger)**: `http://127.0.0.1:8000/docs`
* **Alternative ReDoc UI**: `http://127.0.0.1:8000/redoc`

---

## 🧪 Running Integration Tests

The backend includes a comprehensive integration test client verifying registration, login sessions, transaction queries, uploads, analytics summarizations, and PDF compilations against an in-memory SQLite database:
```powershell
cd backend
.\venv\Scripts\activate
python -m unittest tests/test_api.py
```
