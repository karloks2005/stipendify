import uuid

from fastapi_users import schemas
from typing import Optional, Literal
from enum import Enum
from modules.models import UserRole
from pydantic import BaseModel, Field
from datetime import datetime, timedelta



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

class StudyType(str, Enum):
    undergrad = 'Prijediplomski'
    grad = 'Diplomski'
    professional = 'Stručni'
    postgrad_doc = 'Poslijediplomski doktorski'
    specialist_grad = 'Specijalistički diplomski stručni'
    postgrad_spec = 'Poslijediplomski specijalistički'

class ScholarshipBase(BaseModel):
    name: str
    value: Optional[int] = Field(gt=0)
    url: str
    organisation_work: bool = False
    min_grade_average: Optional[float] = Field(ge=1.00, le=5.00)
    field_of_study: Optional[str] = None
    type_of_study: Optional[StudyType] = None
    min_year_of_study: Optional[Literal[0, 1, 2, 3, 4, 5]] = None
    length_of_scholarship: Optional[timedelta] = None
    length_of_work: Optional[timedelta] = None
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


class OrganisationCreate(BaseModel):
    name: str
    email: str
    password: str
    oib: str
    address: str

    class Config:
        from_attributes = True

class OrganisationRead(BaseModel):
    name: str

    class Config:
        from_attributes = True


class EmailReminderBase(BaseModel):
    user_id: uuid.UUID
    scholarship_id: uuid.UUID
    is_sent: bool
    created_at: datetime
    remind_at: datetime  

    class Config:
        from_attributes = True 

class EmailReminderCreate(BaseModel):
    scholarship_id: uuid.UUID
    remind_at: datetime

    class Config:
        from_attributes = True

class EmailReminderRead(EmailReminderBase):
    id: uuid.UUID

class EmailReminderUpdate(BaseModel):
    scholarship_id: Optional[uuid.UUID] = None
    is_sent: Optional[bool] = None
    created_at: Optional[datetime] = None
    remind_at: Optional[datetime] = None
