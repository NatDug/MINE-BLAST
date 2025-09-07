from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.map import MapLayer
from app.schemas.map import MapLayerCreate, MapLayerOut
import json

router = APIRouter()


@router.post("/", response_model=MapLayerOut)
def create_layer(payload: MapLayerCreate, db: Session = Depends(get_db)):
	layer = MapLayer(name=payload.name, layer_type=payload.layer_type, geojson=json.dumps(payload.geojson), created_by_id=1)
	db.add(layer)
	db.commit()
	db.refresh(layer)
	return layer


@router.get("/", response_model=List[MapLayerOut])
def list_layers(db: Session = Depends(get_db)):
	layers = db.query(MapLayer).all()
	for l in layers:
		try:
			l.geojson = json.loads(l.geojson)
		except Exception:
			pass
	return layers


@router.get("/{layer_id}", response_model=MapLayerOut)
def get_layer(layer_id: int, db: Session = Depends(get_db)):
	layer = db.query(MapLayer).filter(MapLayer.id == layer_id).first()
	if not layer:
		raise HTTPException(status_code=404, detail="Layer not found")
	try:
		layer.geojson = json.loads(layer.geojson)
	except Exception:
		pass
	return layer
