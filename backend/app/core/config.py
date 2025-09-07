from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os


class Settings(BaseSettings):
	postgres_host: str = Field(default="db")
	postgres_port: int = Field(default=5432)
	postgres_user: str = Field(default="mine_user")
	postgres_password: str = Field(default="mine_pass")
	postgres_db: str = Field(default="mine_blast")

	jwt_secret_key: str = Field(default="change-me-secret")
	jwt_algorithm: str = Field(default="HS256")
	access_token_expire_minutes: int = Field(default=60 * 24)

	cors_allow_origins: List[str] = Field(
		default_factory=lambda: [
			"http://localhost",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		]
	)

	@property
	def database_url(self) -> str:
		# Use SQLite for easier local development
		import os
		sqlite_path = os.path.join(os.path.dirname(__file__), "..", "..", "mine_blast.db")
		return f"sqlite:///{sqlite_path}"
		
		# Uncomment below for PostgreSQL
		# return (
		# 	f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}@"
		# 	f"{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
		# )

	class Config:
		env_file = os.getenv("BACKEND_ENV_FILE", ".env")
		env_file_encoding = "utf-8"


settings = Settings()
