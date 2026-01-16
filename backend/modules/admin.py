import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from modules.db import get_async_session
from modules.models import Scholarship, User, Organisation
from modules.schemas import ScholarshipCreate, ScholarshipRead, ScholarshipUpdate, Statistics
from modules.users import current_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/scholarships", response_model=list[ScholarshipRead])
async def unlisted_scholarships(
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(select(Scholarship).where(not Scholarship.is_allowed))
    scholarships = result.scalars().all()
    return scholarships


@router.get("/stats", response_model=Statistics)
async def unlisted_scholarships(
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_async_session),
):
    db_count = lambda x: select(func.count()).select_from(x)
    users = (await session.execute(db_count(User))).scalar()
    orgs = (await session.execute(db_count(Organisation))).scalar()
    active_scholarships = (await session.execute(db_count(Scholarship).where(Scholarship.is_allowed))).scalar()
    inactive_scholarships = (await session.execute(db_count(Scholarship).where(not Scholarship.is_allowed))).scalar()
    return Statistics(users=users, orgs=orgs, active_scholarships=active_scholarships, inactive_scholarships=inactive_scholarships)
