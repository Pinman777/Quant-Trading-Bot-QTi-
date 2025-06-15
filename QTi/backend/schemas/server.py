from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
import re

class ServerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    host: str = Field(..., min_length=1, max_length=255)
    port: int = Field(..., ge=1, le=65535)
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=100)
    rclone_config: Dict[str, Any]

    @validator('host')
    def validate_host(cls, v):
        # Basic host validation (IP or domain name)
        if not re.match(r'^[a-zA-Z0-9.-]+$', v):
            raise ValueError('Invalid host format')
        return v

class ServerCreate(ServerBase):
    pass

class ServerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    host: Optional[str] = Field(None, min_length=1, max_length=255)
    port: Optional[int] = Field(None, ge=1, le=65535)
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=1, max_length=100)
    rclone_config: Optional[Dict[str, Any]] = None

    @validator('host')
    def validate_host(cls, v):
        if v is not None:
            if not re.match(r'^[a-zA-Z0-9.-]+$', v):
                raise ValueError('Invalid host format')
        return v

class ServerResponse(ServerBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ServerStatus(BaseModel):
    status: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    timestamp: datetime 