from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import crud, schemas, security
from ..database import get_db
from ..config import settings
from ..models import User
from ..dependencies import get_current_user
from ..services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])
auth_service = AuthService()

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    user = security.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=schemas.User)
async def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Register a new user"""
    # Check if username exists
    if auth_service.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    if auth_service.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = auth_service.create_user(db, user_data)
    return user

@router.get("/me", response_model=schemas.User)
async def read_users_me(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get current user information"""
    return current_user

@router.put("/me", response_model=schemas.User)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    updated_user = crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user

@router.get("/me/settings", response_model=schemas.UserSettings)
async def read_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    settings = crud.get_user_settings(db, current_user.id)
    if not settings:
        # Create default settings if they don't exist
        settings = crud.create_user_settings(
            db,
            schemas.UserSettingsCreate(user_id=current_user.id)
        )
    return settings

@router.put("/me/settings", response_model=schemas.UserSettings)
async def update_user_settings(
    settings_update: schemas.UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    updated_settings = crud.update_user_settings(db, current_user.id, settings_update)
    if not updated_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User settings not found"
        )
    return updated_settings

@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """Login user and return access token"""
    user = auth_service.authenticate_user(
        db,
        form_data.username,
        form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Refresh access token"""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": current_user.username},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Logout user"""
    return {"message": "Successfully logged out"} 