from typing import Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.blast import Blast, Hole
from app.services.analytics import compute_powder_factor, summarize_burden_spacing

router = APIRouter()


@router.get("/{blast_id}/summary")
def analysis_summary(blast_id: int, db: Session = Depends(get_db)) -> Dict:
	blast = db.query(Blast).filter(Blast.id == blast_id).first()
	if not blast:
		raise HTTPException(status_code=404, detail="Blast not found")

	burdens = [h.burden for h in blast.holes]
	spacings = [h.spacing for h in blast.holes]
	return {
		"burden": summarize_burden_spacing(burdens),
		"spacing": summarize_burden_spacing(spacings),
		"holes": len(blast.holes),
	}


@router.get("/{blast_id}/powder-factor")
def analysis_powder_factor(
	blast_id: int,
	rock_density_t_m3: float = 2.7,
	bench_height_m: float = 10.0,
	db: Session = Depends(get_db),
):
	blast = db.query(Blast).filter(Blast.id == blast_id).first()
	if not blast:
		raise HTTPException(status_code=404, detail="Blast not found")

	results = []
	for h in blast.holes:
		if not all([
			h.explosive_density_kg_m3,
			h.explosive_column_m,
			h.diameter_mm,
			h.burden,
			h.spacing,
		]):
			continue
		pf = compute_powder_factor(
			rock_density_t_m3=rock_density_t_m3,
			explosive_density_kg_m3=h.explosive_density_kg_m3,
			explosive_column_m=h.explosive_column_m,
			hole_diameter_mm=h.diameter_mm,
			burden_m=h.burden,
			spacing_m=h.spacing,
			bench_height_m=bench_height_m,
		)
		results.append(pf)

	if not results:
		return {"avg_powder_factor": 0.0}
	return {"avg_powder_factor": sum(results) / len(results)}
