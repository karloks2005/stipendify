import uuid

from fastapi_users import schemas
from typing import Optional
from modules.models import UserRole
from pydantic import BaseModel


class UserRead(schemas.BaseUser[uuid.UUID]):
    first_name: Optional[str]
    last_name: Optional[str]
    role: UserRole


class UserCreate(schemas.BaseUserCreate):
    first_name: Optional[str]
    last_name: Optional[str]
    organisation_id: Optional[uuid.UUID] = None


class UserUpdate(schemas.BaseUserUpdate):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organisation_id: Optional[uuid.UUID] = None


class UserCreate(schemas.BaseUserCreate):
    first_name: Optional[str]
    last_name: Optional[str]
    organisation_id: Optional[uuid.UUID] = None


class ScholarshipBase(BaseModel):
    name: str
    value: int
    url: str
    organisation_work: bool = False
    min_grade_average: Optional[float] = None
    field_of_study: Optional[str] = None
    type_of_study: Optional[str] = None
    min_year_of_study: Optional[int] = None
    length_of_scholarship: Optional[str] = None
    length_of_work: Optional[str] = None
    important_dates: Optional[dict] = None

    class Config:
        from_attributes = True


class ScholarshipCreate(ScholarshipBase):
    pass  # ima sva polja kao ScholarshipBase


class ScholarshipUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[int] = None
    url: Optional[str] = None
    organisation_work: Optional[bool] = None
    min_grade_average: Optional[float] = None
    field_of_study: Optional[str] = None
    type_of_study: Optional[str] = None
    min_year_of_study: Optional[int] = None
    length_of_scholarship: Optional[str] = None
    length_of_work: Optional[str] = None
    important_dates: Optional[dict] = None

    class Config:
        from_attributes = True


class ScholarshipRead(ScholarshipBase):
    id: uuid.UUID
    organisation_id: Optional[uuid.UUID] = None
