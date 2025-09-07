from pydantic import BaseModel
from typing import Any


class MapLayerBase(BaseModel):
	name: str
	layer_type: str = "feature"
	geojson: Any


class MapLayerCreate(MapLayerBase):
	pass


class MapLayerOut(MapLayerBase):
	id: int

	class Config:
		from_attributes = True
