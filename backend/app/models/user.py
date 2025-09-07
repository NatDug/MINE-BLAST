from sqlalchemy import Column, Integer, String, DateTime, func, UniqueConstraint
from app.db.base import Base


class User(Base):
	__tablename__ = "users"
	__table_args__ = (
		UniqueConstraint("email", name="uq_users_email"),
	)

	id = Column(Integer, primary_key=True, index=True)
	email = Column(String(255), nullable=False, index=True)
	full_name = Column(String(255), nullable=True)
	password_hash = Column(String(255), nullable=False)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
