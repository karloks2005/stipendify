import uvicorn
import asyncio
import sys
import os
from contextlib import asynccontextmanager, suppress

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules.db import create_db_and_tables, async_session_maker
from modules.models import User
from modules.schemas import UserCreate, UserRead, UserUpdate
from modules.users import auth_backend, current_active_user, fastapi_users, google_oauth_client, auth_backend, create_user
from modules.utils.background_workers import load_scholarships_loop, send_emails_loop

from modules.email_reminders import router as email_reminders_router
from modules.scholarships import router as scholarships_router
from modules.organisations import router as orgs_router
from modules.admin import router as admin_router

FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://stipendify.tk0.eu')

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    try:
        async with async_session_maker() as session:
            await create_user(session, 
                            os.getenv("ADMIN_USER", "admin@example.com"), 
                            os.getenv("ADMIN_PASS", "Testpass123"), 
                            is_superuser=True)
    except:
        pass
    scrape_task = asyncio.create_task(load_scholarships_loop())
    email_task = asyncio.create_task(send_emails_loop())
    app.state.scrape_task = scrape_task
    app.state.email_task = email_task

    yield

    email_task.cancel()
    scrape_task.cancel()
    with suppress(asyncio.CancelledError):
        await asyncio.gather(email_task, scrape_task)

app = FastAPI(lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=[
    "http://localhost:3000", "http://localhost:7887", "http://localhost:8887", "https://stipendify.tk0.eu"], allow_methods=["GET", "POST"], allow_headers=["authorization"], allow_credentials=True)

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
        redirect_url=f"{FRONTEND_URL}/callback"),
    prefix="/auth/google",
    tags=["auth"],
)

app.include_router(scholarships_router)
app.include_router(email_reminders_router)
app.include_router(orgs_router)
app.include_router(admin_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000,
                forwarded_allow_ips=["stipendify_backend_1", "10.89.1.2", "10.89.0.3", "10.89.17.3"])
