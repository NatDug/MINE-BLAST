from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class DrillPlan(Base):
	__tablename__ = "drill_plans"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(255), nullable=False)
	description = Column(String(1024), nullable=True)
	bench = Column(String(255), nullable=True)
	burden = Column(Float, nullable=False)
	spacing = Column(Float, nullable=False)
	rows = Column(Integer, nullable=False)
	cols = Column(Integer, nullable=False)
	origin_x = Column(Float, nullable=False, default=0.0)
	origin_y = Column(Float, nullable=False, default=0.0)
	grid_geojson = Column(Text, nullable=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

	created_by = relationship("User")
