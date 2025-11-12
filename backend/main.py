from modules.scholarships import router as scholarships_router
import uvicorn
import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules.db import create_db_and_tables, async_session_maker, engine
from modules.models import User, Scholarship
from modules.schemas import UserCreate, UserRead, UserUpdate
from modules.users import auth_backend, current_active_user, fastapi_users, google_oauth_client, auth_backend
import os
from modules.scrapers import scrape_scholarships
import sys
from sqlalchemy import select


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
    "http://localhost:3000"], allow_methods=["GET", "POST"], allow_headers=["authorization"], allow_credentials=True)

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
        google_oauth_client, auth_backend, SECRET, associate_by_email=True, redirect_url="http://localhost:3000/callback"),
    prefix="/auth/google",
    tags=["auth"],
)

app.include_router(scholarships_router)


@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hi {user.email}!"}


async def load_scholarships_async():
    print("Loading new scholarships!!", file=sys.stderr)
    data = scrape_scholarships()
    urls = [s.url for s in data]

    async with async_session_maker() as session:
        existing = await session.execute(
            select(Scholarship.url).where(Scholarship.url.in_(urls)))
        existing = set(existing.scalars().all())
        new = [x for x in data if x.url not in existing]
        print(f"Adding {len(new)} NEW scholarships", file=sys.stderr)
        print(new, file=sys.stderr)
        session.add_all(new)
        print("added", file=sys.stderr)
        try:
            await session.commit()
            print("commited", file=sys.stderr)
        except Exception as e:
            print("failed", file=sys.stderr)
            print(e, file=sys.stderr)


async def load_scholarships_loop():
    while True:
        await load_scholarships_async()
        await asyncio.sleep(8*60*60)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000)
