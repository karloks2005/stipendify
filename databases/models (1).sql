-- PostgreSQL

CREATE TABLE organisation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    oib VARCHAR(11) NOT NULL UNIQUE,
    address TEXT NOT NULL
);

CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    first_name VARCHAR,
    last_name VARCHAR,
    organisation_id UUID REFERENCES organisation(id) ON DELETE SET NULL
);

CREATE TABLE oauth_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oauth_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    expires_at INTEGER,
    refresh_token TEXT,
    account_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE user_form (
    user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    city VARCHAR,
    county VARCHAR,
    minority BOOLEAN NOT NULL DEFAULT FALSE,
    year_of_study INTEGER,
    field_of_study TEXT,
    type_of_study TEXT,
    grade_point_average NUMERIC(3, 2),
    sports_category INTEGER,
    ses VARCHAR,
    CONSTRAINT ck_user_form_year_of_study
        CHECK (year_of_study IN (0,1,2,3,4,5,6)),
    CONSTRAINT ck_user_form_type_of_study
        CHECK (type_of_study IN (
            'Preddiplomski',
            'Diplomski',
            'Poslijediplomski',
            'Poslijediplomski specijalistički',
            'Specijalistički diplomski stručni',
            'Stručni'
        )),
    CONSTRAINT ck_user_form_gpa
        CHECK (grade_point_average >= 1.00 AND grade_point_average <= 5.00),
    CONSTRAINT ck_user_form_sports_category
        CHECK (sports_category IN (0,1,2,3,4,5,6)),
    CONSTRAINT ck_user_form_ses
        CHECK (ses IN ('nizak', 'srednji', 'visok'))
);

CREATE TABLE scholarship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    value INTEGER,
    url TEXT NOT NULL,
    organisation_work BOOLEAN NOT NULL DEFAULT FALSE,
    min_grade_average NUMERIC(3, 2),
    field_of_study TEXT,
    type_of_study TEXT,
    min_year_of_study INTEGER,
    length_of_scholarship INTERVAL,
    length_of_work INTERVAL,
    important_dates JSONB,
    description TEXT,
    organisation_id UUID REFERENCES organisation(id) ON DELETE CASCADE,
    CONSTRAINT ck_scholarship_value
        CHECK (value > 0),
    CONSTRAINT ck_scholarship_grades
        CHECK (min_grade_average >= 1.00 AND min_grade_average <= 5.00),
    CONSTRAINT ck_scholarship_type_of_study
        CHECK (
            type_of_study IS NULL OR type_of_study IN (
                'Prijediplomski',
                'Diplomski',
                'Stručni',
                'Poslijediplomski doktorski',
                'Specijalistički diplomski stručni',
                'Poslijediplomski specijalistički'
            )
        ),
    CONSTRAINT ck_scholarship_year_of_study
        CHECK (min_year_of_study IN (0,1,2,3,4,5))
);
CREATE TABLE email_reminder (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(320) NOT NULL,
    is_sent BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    remind_at TIMESTAMP NOT NULL,
    scholarship_id UUID NOT NULL,

    CONSTRAINT fk_email_reminder_user
        FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_email_reminder_scholarship
        FOREIGN KEY (scholarship_id) REFERENCES "scholarship"(id) ON DELETE CASCADE
);
