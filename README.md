# PhantomShell 👻

> **"Your terminal has a ghost. Fortunately, it knows how to debug."**  
> *Summon answers. Exorcise errors. Master the unknown.*

---

## 📖 Project Overview

**PhantomShell** is a local-first, universal AI developer companion designed to live alongside your terminal. Built with a haunted developer workstation aesthetic, PhantomShell helps developers understand code, dissect stack traces, master Computer Science subjects, analyze algorithms, and inspect command-line operations without exposing proprietary code to third-party cloud servers.

PhantomShell connects directly to a locally hosted **Ollama** runtime (`gemma2:2b` by default) and stores history locally in an **SQLite** database.

---

## 🔮 Key Features

1. **👻 Haunted Terminal (Universal AI Chat)**
   - Context-aware dialogue across 25+ programming languages and 20+ Computer Science topics.
   - Switchable Ghost Personalities: *Friendly Ghost*, *Ancient Phantom*, and *Sassy Poltergeist*.
   - Copyable Markdown responses with syntax-highlighted code blocks.
   - One-click archiving to your local Session Journal.

2. **🔥 Error Exorcist (Error & Traceback Analysis)**
   - Systematic 8-section breakdown of compiler errors, stack traces, and crashes:
     1. Error Summary
     2. Evidence Extracted from Input
     3. Likely Root Cause
     4. Investigation Steps
     5. Actionable Fixes & Code Samples
     6. Edge Cases & Boundary Conditions
     7. Missing Context / Information
     8. Confidence Score & Rationale
   - Built-in sample errors (Python, Java, React, Docker) for rapid validation.

3. **🔮 Command Oracle (Safe CLI & Config Explanations)**
   - Deep inspection of terminal commands, flags, and arguments across PowerShell, Bash, CMD, Git, and Docker.
   - Component-by-component breakdown table.
   - Explicit **Risk Level** assessment (Safe, Caution, High Risk) and safer dry-run alternatives.
   - **Zero Execution Guarantee**: Commands are parsed and explained only; PhantomShell never executes shell commands.

4. **⚡ Code Crypt (Code & Algorithm Analysis)**
   - 10 targeted analysis modes: *Explain Code*, *Find Potential Bugs*, *Complexity Analysis*, *Find Edge Cases*, *Improve Readability*, *Compare Approaches*, *Convert Language*, *Explain Algorithm*, *Suggest Unit Tests*, and *Security Review*.
   - In-depth Big-O time and auxiliary space complexity analysis.
   - Preserves original code and clearly highlights proposed adjustments.

5. **📜 Session Journal (Local SQLite Archive)**
   - Persistent local database of saved chats, errors, commands, and code reviews.
   - Filter by category, language, and custom search query.
   - Automatic security scanning to alert before saving potential API keys or tokens.

6. **⚙️ Sanctum Settings & Accessibility**
   - Configurable Ollama Base URL and model selection.
   - Live connection and model availability testing.
   - Spooky Halloween theme toggle and Reduced Motion support.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide React, React Router 7, HTML5, Custom Halloween CSS System |
| **Backend** | Python 3.12+, FastAPI, Uvicorn, Pydantic, HTTPX |
| **Database** | SQLite 3 (Zero setup, embedded local file) |
| **AI Engine** | Ollama local API (Default model: `gemma2:2b`) |

---

## 📐 Architecture

```
phantomshell/
├── backend/
│   ├── models/             # Pydantic schemas (chat, errors, commands, code, journal, settings)
│   ├── routes/             # FastAPI routers for API endpoints
│   ├── services/           # Business logic, prompts, Ollama client, SQLite journal
│   ├── tests/              # Pytest suite with Ollama mocks and validation tests
│   ├── config.py           # Application settings and environment defaults
│   ├── database.py         # SQLite connection, migrations, and secret scanning
│   ├── main.py             # FastAPI entrypoint and lifespan management
│   ├── requirements.txt    # Python dependencies
│   └── pytest.ini          # Test runner configuration
├── frontend/
│   ├── src/
│   │   ├── api/            # API client wrapper
│   │   ├── components/     # GhostMascot, MarkdownView, StatusPill, Modals, Toast
│   │   ├── context/        # AppContext (health polling, settings, toasts)
│   │   ├── pages/          # Dashboard, Terminal, Errors, Commands, Code, Journal, Settings, About
│   │   ├── styles/         # Halloween theme tokens, layout, typography, animations
│   │   ├── App.jsx         # App shell & router
│   │   └── main.jsx        # React root
│   ├── package.json        # Node dependencies & build scripts
│   └── vite.config.js      # Vite dev server & API proxy
├── .gitignore              # Excludes virtual environments, SQLite databases, and logs
└── README.md               # Documentation
```

---

## 📋 Prerequisites

Before running PhantomShell, ensure your Windows workstation has:

1. **Python 3.10+** (Python 3.12 or 3.13 recommended)
2. **Node.js (v18+)** and **npm**
3. **Ollama** installed and running on Windows
4. The **`gemma2:2b`** model installed

### How to Check Your Ollama Model in Windows PowerShell

Open a PowerShell terminal and run:

```powershell
ollama list
```

Verify that `gemma2:2b` is listed:

```
NAME         ID              SIZE      MODIFIED
gemma2:2b    8ccf136fdd52    1.6 GB    ...
```

If it is not present, pull it:

```powershell
ollama pull gemma2:2b
```

Ensure the Ollama service is active:

```powershell
ollama serve
```

---

## 🚀 Setup & Launch on Windows

### 1. Backend Setup

Open a PowerShell terminal and navigate to the backend folder:

```powershell
cd phantomshell\backend
```

Create a virtual environment (if not already created):

```powershell
python -m venv .venv
```

Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI backend server:

```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will start at `http://127.0.0.1:8000`. You can inspect the interactive Swagger documentation at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup

Open a second PowerShell terminal and navigate to the frontend folder:

```powershell
cd phantomshell\frontend
```

Install dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The frontend will start at `http://localhost:5173`. Open this URL in your web browser.

---

## ⚙️ Configuration & Environment Variables

### Backend Configuration (`backend/.env`)

Create `backend/.env` from `backend/.env.example` if you need custom values:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
HOST=127.0.0.1
PORT=8000
DATABASE_PATH=phantomshell.db
DEFAULT_PERSONALITY=Friendly Ghost
TIMEOUT_SECONDS=90.0
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root API greeting and service status |
| `GET` | `/api/health` | Comprehensive backend, database, and Ollama diagnostics |
| `POST` | `/api/chat` | Send conversational prompt to local AI with personality |
| `POST` | `/api/errors/analyze` | Run 8-section error investigation on a traceback |
| `POST` | `/api/commands/explain` | Safe explanation and risk classification of CLI commands |
| `POST` | `/api/code/analyze` | Code Crypt DSA analysis, bug discovery, and translation |
| `GET` | `/api/journal` | List and search SQLite saved session entries |
| `POST` | `/api/journal` | Save a new entry to SQLite |
| `GET` | `/api/journal/{id}` | Retrieve a specific journal entry |
| `DELETE`| `/api/journal/{id}` | Banished/delete an entry from SQLite |
| `POST` | `/api/journal/check-secrets` | Scan text for potential API keys or tokens |
| `GET` | `/api/settings` | Retrieve active settings |
| `POST` | `/api/settings` | Update settings in SQLite |
| `POST` | `/api/settings/test-connection` | Live Ollama health & model availability probe |

---

## 🔒 Security & Privacy Guarantees

1. **Zero Execution of User Code**: PhantomShell never runs user-submitted code or executes suggestions in your shell.
2. **Local AI Exclusively**: Prompts are sent solely to the configured local Ollama endpoint (`http://localhost:11434`).
3. **No Hidden Telemetry**: No tracking, usage analytics, or remote logging.
4. **Local Database**: All journal entries and application preferences stay inside `backend/phantomshell.db`.
5. **Secret Scanner**: Built-in regex detector flags high-entropy keys, AWS tokens, Slack tokens, and private keys before saving.

---

## 🧪 Testing

The backend includes a comprehensive unit and integration test suite using `pytest` and `httpx`. Ollama health checks are mocked so tests can execute reliably in isolated or offline environments.

To run the backend tests:

```powershell
cd phantomshell\backend
.\.venv\Scripts\Activate.ps1
$env:PYTHONPATH="."
pytest -v
```

To build and verify the frontend production bundle:

```powershell
cd phantomshell\frontend
npm run build
```

---

## 🔍 Troubleshooting

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| **"Ghost Missing" in Status** | Ollama daemon is not running | Open PowerShell and run `ollama serve` or open the Ollama desktop app. |
| **"Model Missing" in Status** | `gemma2:2b` is not installed | Run `ollama pull gemma2:2b` in PowerShell. |
| **Timeout during generation** | Model is loading into VRAM/RAM | Small models take 5–10 seconds to respond on CPU; subsequent queries will be faster. |
| **CORS errors** | Frontend port mismatch | Ensure frontend is running on port `5173` or `3000`. |
| **Port 8000 already in use** | Another instance is running | Change `PORT` in `backend/.env` or terminate the occupying process. |

---

## ⚠️ Known Limitations

- **Model Capacity**: `gemma2:2b` is a compact 2-billion parameter model. While remarkably fast and versatile for everyday programming tasks, it may occasionally make minor syntax oversights or hallucinate unfamiliar library features. Always verify code before production deployment.
- **Context Size**: Keep inputs within reasonable limits (under 20,000 characters) for optimal inference latency on consumer CPUs.

---

## 🤝 Contributing

1. Fork or clone this repository.
2. Create a feature branch (`git checkout -b feature/spectral-upgrade`).
3. Ensure all pytest tests pass and frontend builds cleanly.
4. Submit a Pull Request describing your changes.

---

## 📜 License

This software is provided as an open developer companion. A formal open-source license (such as MIT or Apache 2.0) must be selected and added by the repository owner before formal distribution.
