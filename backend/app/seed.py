import csv
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from app.core.config import settings
from app.db.base import Base
from app.models.user import User
from app.models.blast import Blast, Hole
from app.api.auth import get_password_hash


def seed(default_user_email: str = "admin@example.com", default_password: str = "admin123", sample_csv_path: str | None = None):
	engine = create_engine(settings.database_url, pool_pre_ping=True)
	Base.metadata.create_all(bind=engine)
	with Session(engine) as db:
		user = db.query(User).filter(User.email == default_user_email).first()
		if not user:
			user = User(email=default_user_email, full_name="Admin", password_hash=get_password_hash(default_password))
			db.add(user)
			db.commit()
			db.refresh(user)

		if sample_csv_path:
			blast = Blast(name="Sample Blast", description="Seeded from CSV", bench="Bench A", created_by_id=user.id)
			db.add(blast)
			db.flush()
			with open(sample_csv_path, "r", encoding="utf-8") as f:
				reader = csv.DictReader(f)
				for row in reader:
					h = Hole(
						blast_id=blast.id,
						hole_id=row.get("hole_id") or row.get("Hole") or row.get("id") or "",
						burden=_to_float(row.get("burden")),
						spacing=_to_float(row.get("spacing")),
						diameter_mm=_to_float(row.get("diameter_mm")),
						hole_depth_m=_to_float(row.get("hole_depth_m")),
						stemming_m=_to_float(row.get("stemming_m")),
						explosive_density_kg_m3=_to_float(row.get("explosive_density_kg_m3")),
						explosive_column_m=_to_float(row.get("explosive_column_m")),
					)
					db.add(h)
			db.commit()


def _to_float(value):
	try:
		if value is None or value == "":
			return None
		return float(value)
	except Exception:
		return None


if __name__ == "__main__":
	import os
	sample = os.environ.get("SAMPLE_CSV")
	seed(sample_csv_path=sample)
