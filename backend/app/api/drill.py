from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.drill import DrillPlan
from app.schemas.drill import DrillPlanCreate, DrillPlanOut
import json

router = APIRouter()


def _generate_grid_geojson(origin_x: float, origin_y: float, rows: int, cols: int, burden: float, spacing: float):
	features = []
	for r in range(rows):
		for c in range(cols):
			x = origin_x + c * spacing
			y = origin_y + r * burden
			features.append({
				"type": "Feature",
				"properties": {"row": r, "col": c, "name": f"H{r+1}-{c+1}"},
				"geometry": {"type": "Point", "coordinates": [x, y]},
			})
	return {"type": "FeatureCollection", "features": features}


@router.post("/", response_model=DrillPlanOut)
def create_plan(payload: DrillPlanCreate, db: Session = Depends(get_db)):
	geojson = _generate_grid_geojson(
		origin_x=payload.origin_x,
		origin_y=payload.origin_y,
		rows=payload.rows,
		cols=payload.cols,
		burden=payload.burden,
		spacing=payload.spacing,
	)
	plan = DrillPlan(
		name=payload.name,
		description=payload.description,
		bench=payload.bench,
		burden=payload.burden,
		spacing=payload.spacing,
		rows=payload.rows,
		cols=payload.cols,
		origin_x=payload.origin_x,
		origin_y=payload.origin_y,
		grid_geojson=json.dumps(geojson),
		created_by_id=1,
	)
	db.add(plan)
	db.commit()
	db.refresh(plan)
	return plan


@router.get("/", response_model=List[DrillPlanOut])
def list_plans(db: Session = Depends(get_db)):
	plans = db.query(DrillPlan).all()
	for p in plans:
		if p.grid_geojson:
			try:
				p.grid_geojson = json.loads(p.grid_geojson)
			except Exception:
				pass
	return plans
