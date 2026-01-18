import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from textwrap import shorten

from modules.db import get_async_session
from modules.models import Scholarship, User
from modules.schemas import ScholarshipCreate, ScholarshipRead, ScholarshipUpdate
from modules.users import current_org_user
from modules.utils.gcal_url_generator import generate_url

router = APIRouter(prefix="/scholarships", tags=["scholarships"])


@router.get("/", response_model=list[ScholarshipRead])
async def list_scholarships(
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(select(Scholarship).where(Scholarship.is_allowed))
    scholarships = result.scalars().all()
    return scholarships

@router.get("/add-to-gcal/{scholarship_id}")
async def add_to_gcal(scholarship_id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    scholarship = await session.get(Scholarship, scholarship_id)
    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    dates = scholarship.important_dates
    if dates is not None:
        date = dates.get("end_date")
    else:
        date = None
    if date is not None:
        date = datetime.fromisoformat(date)
    else:
        date = datetime.now()
    name = f"[Stipendify] {scholarship.name}"
    description = f"Stipendify reminder:\n{shorten(scholarship.description, width=240, placeholder="...")}\n\nhttps://stipendify.tk0.eu"
    return RedirectResponse(url=generate_url(name, description, date))


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
    user: User = Depends(current_org_user),
):
    if user.is_superuser == False:
        data.is_allowed = False
    scholarship = Scholarship(organisation_id = user.organisation_id, **data.model_dump())
    session.add(scholarship)
    await session.commit()
    await session.refresh(scholarship)
    return scholarship


@router.put("/{scholarship_id}", response_model=ScholarshipRead)
async def update_scholarship(
    scholarship_id: uuid.UUID,
    data: ScholarshipUpdate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_org_user),
):
    scholarship = await session.get(Scholarship, scholarship_id)
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    if scholarship.organisation_id != user.organisation_id and user.is_superuser == False:
        raise HTTPException(status_code=401, detail="Unauthorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "is_allowed" and value == True and user.is_superuser == False:
            continue # dont allow orgs to make own scholarships visible
        setattr(scholarship, field, value)

    await session.commit()
    await session.refresh(scholarship)
    return scholarship


@router.delete("/{scholarship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scholarship(
    scholarship_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_org_user),
):
    scholarship = await session.get(Scholarship, scholarship_id)
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    if scholarship.organisation_id != user.organisation_id and user.is_superuser == False:
        raise HTTPException(status_code=401, detail="Unauthorized")

    await session.delete(scholarship)
    await session.commit()
    return None
