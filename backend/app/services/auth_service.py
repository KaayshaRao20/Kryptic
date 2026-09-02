from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User, Organization
from app.schemas.auth import RegisterRequest


class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    @staticmethod
    def get_password_hash(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None

    @classmethod
    def authenticate_user(cls, db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if not user or not user.is_active:
            return None
        if not cls.verify_password(password, user.hashed_password):
            return None
        return user

    @classmethod
    def register_user(cls, db: Session, req: RegisterRequest) -> User:
        # Check existing
        existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
        if existing:
            raise ValueError(f"User with email {req.email} already exists")

        # Resolve organization
        org = None
        if req.organization_slug:
            org = db.query(Organization).filter(Organization.slug == req.organization_slug).first()
            if not org:
                org = Organization(name="Default Org", slug=req.organization_slug, tier="enterprise")
                db.add(org)
                db.commit()
                db.refresh(org)

        hashed_pw = cls.get_password_hash(req.password)
        new_user = User(
            email=req.email.lower().strip(),
            hashed_password=hashed_pw,
            full_name=req.full_name,
            role=req.role or "analyst",
            organization_id=org.id if org else None,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user


auth_service = AuthService()
