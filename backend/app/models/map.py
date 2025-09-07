from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class MapLayer(Base):
	__tablename__ = "map_layers"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(255), nullable=False, index=True)
	layer_type = Column(String(64), nullable=False, default="feature")
	geojson = Column(Text, nullable=False)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

	created_by = relationship("User")
