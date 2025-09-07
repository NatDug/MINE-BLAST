from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Blast(Base):
	__tablename__ = "blasts"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(255), nullable=False)
	description = Column(String(1024), nullable=True)
	bench = Column(String(255), nullable=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

	created_by = relationship("User")
	holes = relationship("Hole", back_populates="blast", cascade="all, delete-orphan")


class Hole(Base):
	__tablename__ = "holes"

	id = Column(Integer, primary_key=True, index=True)
	blast_id = Column(Integer, ForeignKey("blasts.id"), nullable=False, index=True)
	hole_id = Column(String(64), nullable=False)
	burden = Column(Float, nullable=True)
	spacing = Column(Float, nullable=True)
	diameter_mm = Column(Float, nullable=True)
	hole_depth_m = Column(Float, nullable=True)
	stemming_m = Column(Float, nullable=True)
	explosive_density_kg_m3 = Column(Float, nullable=True)
	explosive_column_m = Column(Float, nullable=True)

	blast = relationship("Blast", back_populates="holes")
