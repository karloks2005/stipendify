import uuid

from fastapi_users import schemas
from typing import Optional
from modules.models import UserRole
from pydantic import BaseModel


class UserCommon():
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organisation_id: Optional[uuid.UUID] = None


class UserRead(schemas.BaseUser[uuid.UUID], UserCommon):
    role: UserRole


class UserCreate(schemas.BaseUserCreate, UserCommon):
    pass


class UserUpdate(schemas.BaseUserUpdate, UserCommon):
    pass


class ScholarshipBase(BaseModel):
    name: str
    value: Optional[int] = None
    url: str
    organisation_work: bool = False
    min_grade_average: Optional[float] = None
    field_of_study: Optional[str] = None
    type_of_study: Optional[str] = None
    min_year_of_study: Optional[int] = None
    length_of_scholarship: Optional[str] = None
    length_of_work: Optional[str] = None
    important_dates: Optional[dict] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ScholarshipCreate(ScholarshipBase):
    pass


class ScholarshipUpdate(ScholarshipBase):
    name: Optional[str] = None
    url: Optional[str] = None


class ScholarshipRead(ScholarshipBase):
    id: uuid.UUID
    organisation_id: Optional[uuid.UUID] = None
