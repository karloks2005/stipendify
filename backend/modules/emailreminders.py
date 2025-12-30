# backend/modules/email_reminders.py
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from modules.db import get_async_session
from modules.models import EmailReminder
from modules.schemas import EmailReminderCreate, EmailReminderRead

router = APIRouter(prefix="/email-reminders", tags=["email-reminders"])


@router.post("", response_model=EmailReminderRead)
async def create_email_reminder(
    payload: EmailReminderCreate,
    session: AsyncSession = Depends(get_async_session),
):
    reminder = EmailReminder(
        user_id=payload.user_id,
        scholarship_id=payload.scholarship_id,
        email=payload.email,
        remind_at=payload.remind_at,
        created_at=datetime.utcnow(),
        is_sent=False,
    )
    session.add(reminder)
    await session.commit()
    await session.refresh(reminder)
    return reminder


@router.get("", response_model=list[EmailReminderRead])
async def list_email_reminders(
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(select(EmailReminder))
    return result.scalars().all()
