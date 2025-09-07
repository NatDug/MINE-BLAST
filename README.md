# Mine Blast Analytics

Backend: FastAPI + Postgres. Frontend: React (Vite). Docker Compose for local dev.

## Run (Docker)

1. Build and start services:
   - `cd infra`
   - `docker compose up --build -d`
2. Seed default user and sample data (optional):
   - `docker exec -it mineblast-backend python -m app.seed`
   - To seed with a CSV inside the repo: `docker exec -e SAMPLE_CSV=/app/samples/sample_holes.csv -it mineblast-backend python -m app.seed`
3. Open API docs: `http://localhost:8000/docs`

## API
- `POST /auth/signup` — create user
- `POST /auth/login` — obtain JWT (OAuth2 password flow)
- `POST /upload/csv` — multipart form fields: `name`, `description`, `bench`, file: CSV
- `POST /blasts/` — create blast with holes JSON
- `GET /blasts/` — list blasts
- `GET /blasts/{id}` — blast detail
- `GET /analysis/{id}/summary` — min/max/avg burden and spacing
- `GET /analysis/{id}/powder-factor?rock_density_t_m3=2.7&bench_height_m=10` — average PF

CSV expected columns (flexible): `hole_id, burden, spacing, diameter_mm, hole_depth_m, stemming_m, explosive_density_kg_m3, explosive_column_m`

## Backend dev (without Docker)
- Create venv and install: `pip install -r backend/requirements.txt`
- Set env or edit defaults in `app/core/config.py`
- Run: `uvicorn app.main:app --reload`

## Frontend
- Will be scaffolded with Vite React TS under `frontend/`. After creation:
  - `cd frontend && npm i && npm run dev`
  - App will call API at `http://localhost:8000`
