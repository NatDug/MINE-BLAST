from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, analysis, blast, upload
from app.db.base import Base
from app.db.session import engine

# Ensure models are imported so that Base.metadata is aware of them
from app.models import user as user_model  # noqa: F401
from app.models import blast as blast_model  # noqa: F401

app = FastAPI(title="Mine Blast Analytics API", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_allow_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)


@app.on_event("startup")
def on_startup() -> None:
	# Create tables if they don't exist (simple bootstrap without migrations)
	Base.metadata.create_all(bind=engine)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(blast.router, prefix="/blasts", tags=["blasts"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])


@app.get("/")
def healthcheck():
	return {"status": "ok"}
