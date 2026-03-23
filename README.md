# Venue Booking Monorepo

This repository is organized as a production-style monorepo with clear separation between frontend and backend.

## Project structure

- `frontend/` — React + Vite client application
- `backend/` — Django REST API, business logic, Docker setup, tests
- `docs/` — project documentation and planning
- `infra/` — infrastructure/deployment assets
- `scripts/` — local automation and helper scripts
- `.github/workflows/` — CI/CD workflows

## Quick start

### Backend

1. Go to backend:
   - `cd backend`
2. Create env file:
   - `cp .env.example .env` (Windows PowerShell: `Copy-Item .env.example .env`)
3. Run locally:
   - `python -m venv .venv`
   - `.venv\Scripts\Activate.ps1`
   - `pip install -r requirements/development.txt`
   - `python manage.py migrate`
   - `python manage.py runserver`

### Frontend

1. Go to frontend:
   - `cd frontend`
2. Install and run:
   - `npm install`
   - `npm run dev`

## Notes

- Backend-specific documentation lives in `backend/README.md`.
- Current VS Code tasks are configured for this split structure.
