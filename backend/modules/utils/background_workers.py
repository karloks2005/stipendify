from sqlalchemy import select
from modules.models import User, Scholarship, Organisation, EmailReminder
from modules.scrapers import scrape_scholarships
from modules.utils.send_email import send_email
import sys, asyncio
from datetime import datetime
from sqlalchemy.orm import joinedload
from modules.db import async_session_maker

async def load_scholarships_async():
    print("Loading new scholarships!!", file=sys.stderr)
    data = scrape_scholarships()
    urls = set(s.url for s, _ in data)
    oibs = set(org.oib for _, org in data)

    async with async_session_maker() as session:
        def add_orgid(s, o, new_orgs):
            org = next(filter(o.__eq__, new_orgs))
            print(org, org.id, file=sys.stderr)
            s.organisation_id = org.id
            return s
        try:
            existing_urls = set((await session.scalars(
                select(Scholarship.url).where(Scholarship.url.in_(urls)))).all())
            existing_oibs = set((await session.scalars(
                select(Organisation.oib).where(Organisation.oib.in_(oibs)))).all())
            new_orgs = set(
                o for _, o in data if o.oib not in existing_oibs)
            print(f"trying to add {
                  [x.__dict__ for x in new_orgs]}", file=sys.stderr)
            session.add_all(new_orgs)
            print("added", file=sys.stderr)
            print("trying to flush", file=sys.stderr)
            await session.flush()
            print("flushed", file=sys.stderr)
            new_sch = set(
                add_orgid(s, org, new_orgs) for s, org in data if s.url not in existing_urls)

            print(f"Adding {len(new_sch)} new scholarships (and {
                len(new_orgs)} orgs)", file=sys.stderr)
            session.add_all(new_sch)
            print("added")

            await session.commit()
            print("commited", file=sys.stderr)
        except Exception as e:
            print(f"failed ({type(e)}): {e}", file=sys.stderr)

async def send_emails_async():
    print("Sending new emails!!", file=sys.stderr)
    async with async_session_maker() as session:
        try:
            current_time = datetime.now()
            stmt = (
                select(EmailReminder)
                .options(
                    joinedload(EmailReminder.user),
                    joinedload(EmailReminder.scholarship)
                )
                .where(EmailReminder.is_sent == False)
                .where(EmailReminder.remind_at <= current_time)
            )
            reminders = (await session.scalars(stmt)).unique().all()

            emails_sent_count = 0

            for reminder in reminders:
                recipient = reminder.user.email 
                scholarship_name = reminder.scholarship.name               
                subject = f"[Stipendify] Reminder: {scholarship_name}"
                text = (
                    "Hello,\n\n"
                    f"This is a reminder for your scholarship: {scholarship_name}.\n"
                    "Please check your dashboard for more details.\n\n"
                    "Best regards,\nStipendify\n\n"
                    "https://stipendify.tk0.eu\n"
                )

                try:

                    print(f"Sending email to {recipient}", file=sys.stderr)
                    send_email(recipient, subject, text)
                    reminder.is_sent = True
                    emails_sent_count += 1
                except Exception as e:
                    print(f"Failed to send email to {recipient} for reminder {reminder.id}: {e}", file=sys.stderr)
            if emails_sent_count > 0:
                await session.commit()
        except Exception as e:
            print(f"failed ({type(e)}): {e}", file=sys.stderr)

async def load_scholarships_loop():
    while True:
        await load_scholarships_async()
        await asyncio.sleep(8*60*60)

async def send_emails_loop():
    while True:
        await send_emails_async()
        await asyncio.sleep(30*60)
