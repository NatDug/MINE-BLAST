from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
	return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
	if expires_delta is None:
		expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
	expire = datetime.utcnow() + expires_delta
	to_encode = {"sub": subject, "exp": expire}
	encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
	return encoded_jwt


@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
	existing = db.query(User).filter(User.email == user_in.email).first()
	if existing:
		raise HTTPException(status_code=400, detail="Email already registered")
	user = User(email=user_in.email, full_name=user_in.full_name, password_hash=get_password_hash(user_in.password))
	db.add(user)
	db.commit()
	db.refresh(user)
	return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
	user: Optional[User] = db.query(User).filter(User.email == form_data.username).first()
	if not user or not verify_password(form_data.password, user.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
	token = create_access_token(subject=str(user.id))
	return Token(access_token=token)
