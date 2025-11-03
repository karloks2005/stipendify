from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules.db import User, create_db_and_tables
from modules.schemas import UserCreate, UserRead, UserUpdate
from modules.users import auth_backend, current_active_user, fastapi_users, google_oauth_client, auth_backend
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=[
                   "http://localhost:3000"], allow_methods=["GET", "POST"], allow_headers=["*"], allow_credentials=True)

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
        google_oauth_client, auth_backend, SECRET, associate_by_email=True),
    prefix="/auth/google",
    tags=["auth"],
)


@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hi {user.email}!"}
