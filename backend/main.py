from modules.scholarships import router as scholarships_router
import uvicorn
import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules.db import create_db_and_tables, async_session_maker, engine
from modules.models import User, Scholarship, Organisation
from modules.schemas import UserCreate, UserRead, UserUpdate
from modules.users import auth_backend, current_active_user, fastapi_users, google_oauth_client, auth_backend
import os
from modules.scrapers import scrape_scholarships
import sys
from sqlalchemy import select

from modules.email_reminders import router as email_reminders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    task = asyncio.create_task(load_scholarships_loop())
    app.state.scholarship_task = task

    yield

    task.cancel()
    with suppress(asyncio.CancelledError):
        await task

app = FastAPI(lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=[
    "http://localhost:3000", "http://localhost:8888","https://stipendify.tk0.eu"], allow_methods=["GET", "POST"], allow_headers=["authorization"], allow_credentials=True)

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

SECRET = os.getenv("AUTH_KEY")
app.include_router(
    fastapi_users.get_oauth_router(
        google_oauth_client,
        auth_backend,
        SECRET,
        associate_by_email=True,
        redirect_url="https://stipendify.tk0.eu/callback"),
    prefix="/auth/google",
    tags=["auth"],
)

app.include_router(scholarships_router)
app.include_router(email_reminders_router)


@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hi {user.email}!"}


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


async def load_scholarships_loop():
    while True:
        await load_scholarships_async()
        await asyncio.sleep(8*60*60)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000,
                forwarded_allow_ips=["stipendify_backend_1", "10.89.1.2", "10.89.0.3", "10.89.17.3"])
