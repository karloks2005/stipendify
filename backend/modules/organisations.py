import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from modules.db import get_async_session
from modules.models import User, Organisation, Scholarship
from modules.schemas import OrganisationCreate, OrganisationRead, ScholarshipRead, UserRead
from modules.users import current_org_user, create_user

router = APIRouter(prefix="/org", tags=["organisations"])

@router.post(
    "/register", response_model=UserRead, status_code=status.HTTP_201_CREATED
)
async def create_org_user(
    data: OrganisationCreate,
    session: AsyncSession = Depends(get_async_session)
):
    org = Organisation(name = data.name, oib = data.oib, address = data.address)
    session.add(org)
    user = await create_user(session, data.email, data.password)
    user.organisation = org
    session.add(user)
    await session.commit()
    await session.refresh(user)
    await session.refresh(org)
    return user


@router.get("/scholarships", response_model=list[ScholarshipRead])
async def list_scholarships(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_org_user),
):
    if user.organisation_id is None:
        return [] 

    stmt = (
        select(Organisation)
        .where(Organisation.id == user.organisation_id)
        .options(selectinload(Organisation.scholarships))
    )
    
    result = await session.execute(stmt)
    organisation = result.scalars().first()

    if not organisation:
        raise HTTPException(status_code=404, detail="Organisation not found")

    return organisation.scholarships

@router.get("/me", response_model=OrganisationRead)
async def get_me(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_org_user),
):
    stmt = (
        select(Organisation)
        .where(Organisation.id == user.organisation_id)
    )
    
    result = await session.execute(stmt)
    organisation = result.scalars().first()

    if not organisation:
        raise HTTPException(status_code=404, detail="Organisation not found")

    return organisation

@router.get("/{organisation_id}", response_model=OrganisationRead)
async def get_org(
    org_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    stmt = (
        select(Organisation)
        .where(Organisation.id == org_id)
    )
    
    result = await session.execute(stmt)
    organisation = result.scalars().first()

    if not organisation:
        raise HTTPException(status_code=404, detail="Organisation not found")

    return organisation
