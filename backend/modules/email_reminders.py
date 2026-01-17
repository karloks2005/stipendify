from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from modules.db import get_async_session
from modules.models import EmailReminder
from modules.models import EmailReminder, User 
from modules.schemas import EmailReminderCreate, EmailReminderRead, EmailReminderDelete
from modules.users import current_active_user  
from modules.time_utils import to_utc_naive

router = APIRouter(prefix="/email-reminders", tags=["email-reminders"])


@router.post("", response_model=EmailReminderRead)
async def create_email_reminder(
    payload: EmailReminderCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    reminder = EmailReminder(
        user_id=user.id, 
        scholarship_id=payload.scholarship_id,
        remind_at=to_utc_naive(payload.remind_at),
        created_at=datetime.utcnow(),
        is_sent=False,
    )
    session.add(reminder)
    await session.commit()
    await session.refresh(reminder)
    return reminder


@router.get("", response_model=list[EmailReminderRead])
async def list_email_reminders(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    stmt = select(EmailReminder).where(EmailReminder.user_id == user.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router.delete("")
async def delete_email_reminder(
    payload: EmailReminderDelete,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    stmt = delete(EmailReminder).where(EmailReminder.id == payload.id)
    session.execute(stmt)
    await session.commit()
    return "OK"
