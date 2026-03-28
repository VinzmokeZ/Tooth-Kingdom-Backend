# Tooth Kingdom Adventure - Python Backend

This is a standalone Python backend built with FastAPI and SQLite. It serves as a replacement for Firebase for local development or separate handover.

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Setup

1. Navigate to the python backend directory:
   ```bash
   cd backend/python
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Backend

Start the server:
```bash
python main.py
```

## Security Implementation (Professional Standards)

This backend is configured for a **College Submission** using industry-standard security:
- **Password Hashing**: Uses `Bcrypt` (via `passlib`). Passwords are never stored in plain text.
- **Session Management**: Uses **JWT (JSON Web Tokens)**. Upon login, a secure token is issued and used for subsequent requests.

## API Endpoints

- `POST /auth/register`: Real registration (Email & Password).
- `POST /auth/login`: Real login (Returns JWT).
- `POST /auth/google`: Simulated Google login for demo purposes.
- `GET /users/{uid}`: Retrieve user data (SQLite).
- `POST /users/{uid}`: Update user data.

## Database

The backend uses a local `database.db` file (SQLite). It is automatically created on the first run.
