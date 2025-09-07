from pydantic import BaseModel
from typing import Optional, Any


class DrillPlanBase(BaseModel):
	name: str
	description: Optional[str] = None
	bench: Optional[str] = None
	burden: float
	spacing: float
	rows: int
	cols: int
	origin_x: float = 0.0
	origin_y: float = 0.0


class DrillPlanCreate(DrillPlanBase):
	pass


class DrillPlanOut(DrillPlanBase):
	id: int
	grid_geojson: Optional[Any] = None

	class Config:
		from_attributes = True
