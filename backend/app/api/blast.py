from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.blast import Blast, Hole
from app.schemas.blast import BlastCreate, BlastOut

router = APIRouter()


@router.post("/", response_model=BlastOut)
def create_blast(payload: BlastCreate, db: Session = Depends(get_db)):
	blast = Blast(name=payload.name, description=payload.description, bench=payload.bench, created_by_id=1)
	db.add(blast)
	db.flush()
	if payload.holes:
		for h in payload.holes:
			hole = Hole(
				blast_id=blast.id,
				hole_id=h.hole_id,
				burden=h.burden,
				spacing=h.spacing,
				diameter_mm=h.diameter_mm,
				hole_depth_m=h.hole_depth_m,
				stemming_m=h.stemming_m,
				explosive_density_kg_m3=h.explosive_density_kg_m3,
				explosive_column_m=h.explosive_column_m,
			)
			db.add(hole)
	db.commit()
	db.refresh(blast)
	return blast


@router.get("/", response_model=List[BlastOut])
def list_blasts(db: Session = Depends(get_db)):
	return db.query(Blast).all()


@router.get("/{blast_id}", response_model=BlastOut)
def get_blast(blast_id: int, db: Session = Depends(get_db)):
	blast = db.query(Blast).filter(Blast.id == blast_id).first()
	if not blast:
		raise HTTPException(status_code=404, detail="Blast not found")
	return blast
