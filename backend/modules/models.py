# models.py
from enum import Enum
from typing import List

from fastapi_users.db import (
    SQLAlchemyBaseOAuthAccountTableUUID,
    SQLAlchemyBaseUserTableUUID,
)
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INTERVAL
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# ---------- FastAPI-Users core ----------

class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass


class UserRole(str, Enum):
    STUDENT = "student"
    ORGANISATION = "organisation"
    ADMIN = "admin"


class User(SQLAlchemyBaseUserTableUUID, Base):
    # fastapi-users elementi: id, email, hashed_password, is_active, is_superuser, is_verified

    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)

    @property
    def role(self) -> UserRole:
        if self.is_superuser:
            return UserRole.ADMIN
        elif self.organisation_id is not None:
            return UserRole.ORGANISATION
        else:
            return UserRole.STUDENT

    # ako je korisnik organizacija
    organisation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organisation.id", ondelete="SET NULL"),
        nullable=True,
    )
    organisation = relationship("Organisation", back_populates="user")

    oauth_accounts = relationship(
        "OAuthAccount", lazy="joined",
        cascade="all, delete-orphan",
    )

    form = relationship(
        "UserForm",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Organisation(Base):
    __tablename__ = "organisation"

    id = Column(UUID(as_uuid=True), primary_key=True,
                server_default=text("gen_random_uuid()"))
    name = Column(Text, nullable=False)
    oib = Column(String(11), unique=True, nullable=False)
    address = Column(Text, nullable=False)

    user = relationship("User", back_populates="organisation")

    scholarships = relationship(
        "Scholarship",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )


class UserForm(Base):
    __tablename__ = "user_form"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        primary_key=True,
    )

    city = Column(String, nullable=True)
    county = Column(String, nullable=True)
    minority = Column(Boolean, nullable=False, server_default=text("FALSE"))
    year_of_study = Column(Integer, nullable=True)
    field_of_study = Column(Text, nullable=True)
    type_of_study = Column(Text, nullable=True)
    grade_point_average = Column(Numeric(3, 2), nullable=True)
    sports_category = Column(Integer, nullable=True)
    ses = Column("ses", String, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "year_of_study IN (0,1,2,3,4,5,6)",
            name="ck_user_form_year_of_study",
        ),
        CheckConstraint(
            """type_of_study IN (
                'Preddiplomski', 'Diplomski', 'Poslijediplomski',
                'Poslijediplomski specijalistički',
                'Specijalistički diplomski stručni',
                'Stručni'
            )""",
            name="ck_user_form_type_of_study",
        ),
        CheckConstraint(
            "grade_point_average >= 1.00 AND grade_point_average <= 5.00",
            name="ck_user_form_gpa",
        ),
        CheckConstraint(
            "sports_category IN (0,1,2,3,4,5,6)",
            name="ck_user_form_sports_category",
        ),
        CheckConstraint(
            "ses IN ('nizak', 'srednji', 'visok')",
            name="ck_user_form_ses",
        ),
    )

    user = relationship("User", back_populates="form")


class Scholarship(Base):
    __tablename__ = "scholarship"

    scholarship_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    scholarship_name = Column(Text, nullable=False)
    scholarship_value = Column(Integer, nullable=False)
    scholarship_link = Column(Text, nullable=False)
    organisation_work = Column(
        Boolean, nullable=False, server_default=text("FALSE"))
    min_grade_average = Column(Numeric(3, 2), nullable=True)
    field_of_study = Column(Text, nullable=True)
    type_of_study = Column(Text, nullable=True)
    min_year_of_study = Column(Integer, nullable=True)
    length_of_scholarship = Column(INTERVAL, nullable=False)
    length_of_work = Column(INTERVAL, nullable=True)
    important_dates = Column(JSONB, nullable=False)

    organisation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organisation.id", ondelete="CASCADE"),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "scholarship_value > 0",
            name="ck_scholarship_value",
        ),
        CheckConstraint(
            "min_grade_average >= 1.00 AND min_grade_average <= 5.00",
            name="ck_scholarship_grades",
        ),
        CheckConstraint(
            """type_of_study IS NULL OR type_of_study IN (
                'Brucoš', 'Prijediplomski', 'Diplomski',
                'Stručni',
                'Poslijediplomski doktorski',
                'Specijalistički diplomski stručni',
                'Poslijediplomski specijalistički'
            )""",
            name="ck_scholarship_type_of_study",
        ),
        CheckConstraint(
            "min_year_of_study IN (0,1,2,3,4,5)",
            name="ck_scholarship_year_of_study",
        ),
    )

    organisation = relationship("Organisation", back_populates="scholarships")
