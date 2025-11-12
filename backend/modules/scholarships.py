import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from modules.db import get_async_session
from modules.models import Scholarship, User
from modules.schemas import ScholarshipCreate, ScholarshipRead, ScholarshipUpdate
from modules.users import current_admin_user

router = APIRouter(prefix="/scholarships", tags=["scholarships"])


@router.get("/", response_model=list[ScholarshipRead])
async def list_scholarships(
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(select(Scholarship))
    scholarships = result.scalars().all()
    return scholarships


@router.get("/{scholarship_id}", response_model=ScholarshipRead)
async def get_scholarship(
    scholarship_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    scholarship = await session.get(Scholarship, scholarship_id)
    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return scholarship


@router.post(
    "/", response_model=ScholarshipRead, status_code=status.HTTP_201_CREATED
)
async def create_scholarship(
    data: ScholarshipCreate,
    session: AsyncSession = Depends(get_async_session),
    admin: User = Depends(current_admin_user),
):
    scholarship = Scholarship(**data.model_dump())
    session.add(scholarship)
    await session.commit()
    await session.refresh(scholarship)
    return scholarship


@router.put("/{scholarship_id}", response_model=ScholarshipRead)
async def update_scholarship(
    scholarship_id: uuid.UUID,
    data: ScholarshipUpdate,
    session: AsyncSession = Depends(get_async_session),
    admin: User = Depends(current_admin_user),
):
    scholarship = await session.get(Scholarship, scholarship_id)
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(scholarship, field, value)

    await session.commit()
    await session.refresh(scholarship)
    return scholarship


@router.delete("/{scholarship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scholarship(
    scholarship_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    admin: User = Depends(current_admin_user),
):
    scholarship = await session.get(Scholarship, scholarship_id)
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    await session.delete(scholarship)
    await session.commit()
    return None
