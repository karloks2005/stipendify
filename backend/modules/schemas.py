import uuid

from fastapi_users import schemas
from typing import Optional


class OAuthAccountRead(schemas.BaseOAuthAccount):
    pass


class UserRead(schemas.BaseUser[uuid.UUID]):
    first: Optional[str]
    last: Optional[str]
    company_name: Optional[str]
    is_orga: bool


class UserCreate(schemas.BaseUserCreate):
    first: Optional[str]
    last: Optional[str]
    company_name: Optional[str]
    is_orga: bool


class UserUpdate(schemas.BaseUserUpdate):
    first: Optional[str] = None
    last: Optional[str] = None
    company_name: Optional[str] = None
    is_orga: Optional[bool] = None
