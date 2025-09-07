import csv
from io import StringIO
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.blast import Blast, Hole

router = APIRouter()


@router.post("/csv")
async def upload_csv(
	name: str = Form(...),
	description: str = Form(""),
	bench: str = Form(""),
	file: UploadFile = File(...),
	db: Session = Depends(get_db),
):
	if not file.filename.endswith(".csv"):
		raise HTTPException(status_code=400, detail="Only CSV files are supported")
	text = (await file.read()).decode("utf-8")
	reader = csv.DictReader(StringIO(text))

	blast = Blast(name=name, description=description, bench=bench, created_by_id=1)
	db.add(blast)
	db.flush()

	for row in reader:
		hole = Hole(
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
		db.add(hole)

	db.commit()
	db.refresh(blast)
	return {"id": blast.id}


def _to_float(value):
	try:
		if value is None or value == "":
			return None
		return float(value)
	except Exception:
		return None
