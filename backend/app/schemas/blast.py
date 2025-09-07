from pydantic import BaseModel
from typing import Optional, List


class HoleBase(BaseModel):
	hole_id: str
	burden: Optional[float] = None
	spacing: Optional[float] = None
	diameter_mm: Optional[float] = None
	hole_depth_m: Optional[float] = None
	stemming_m: Optional[float] = None
	explosive_density_kg_m3: Optional[float] = None
	explosive_column_m: Optional[float] = None


class HoleCreate(HoleBase):
	pass


class HoleOut(HoleBase):
	id: int

	class Config:
		from_attributes = True


class BlastBase(BaseModel):
	name: str
	description: Optional[str] = None
	bench: Optional[str] = None


class BlastCreate(BlastBase):
	holes: Optional[List[HoleCreate]] = None


class BlastOut(BlastBase):
	id: int
	holes: List[HoleOut] = []

	class Config:
		from_attributes = True
