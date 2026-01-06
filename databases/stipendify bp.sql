CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "user"
(
  id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  user_type TEXT NOT NULL CHECK (user_type IN ('regular','organisation','admin'))
);
CREATE TABLE user_organisation
(
   user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
   organisation_name TEXT NOT NULL,
   organisation_oib VARCHAR (11) UNIQUE NOT NULL,
   organisation_address TEXT NOT NULL
);
CREATE TABLE user_regular
(
   user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
   regular_name TEXT NOT NULL,
   regular_surname TEXT NOT NULL,
   regular_username VARCHAR(30) NOT NULL
);
CREATE TABLE user_admin
(
   user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
   admin_name TEXT NOT NULL,
   admin_surname TEXT NOT NULL,
   admin_role VARCHAR  CHECK (admin_role IN ('moderator', 'support'))
);
CREATE TABLE user_form
(
  city VARCHAR,
  county VARCHAR,
  minority BOOLEAN NOT NULL DEFAULT FALSE,
  year_of_study INT CHECK(year_of_study IN(0,1,2,3,4,5,6)),
  field_of_study TEXT,
  type_of_study TEXT CHECK (type_of_study IN(
        'Brucoš',
  		'Prijediplomski',
  		'Diplomski',
  		'Stručni',
	  	'Poslijediplomski doktorski',
		'Specijalistički diplomski stručni',
		'Poslijediplomski specijalistički')
		),
  grade_point_average NUMERIC(3,2) CHECK (grade_point_average >= 1.00 AND grade_point_average <= 5.00),
  sports_category INT CHECK (sports_category IN (0,1,2,3,4,5,6)),
  SES VARCHAR  CHECK (SES IN ('nizak', 'srednji', 'visok')),
  user_id UUID PRIMARY KEY REFERENCES user_regular(user_id) ON DELETE CASCADE

);
CREATE TABLE scholarship
(
  scholarship_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_name TEXT NOT NULL,
  scholarship_value INT CHECK (scholarship_value > 0) NOT NULL,
  scholarship_link TEXT NOT NULL,
  organisation_work BOOLEAN NOT NULL DEFAULT FALSE,
  min_grade_average NUMERIC(3,2) CHECK (min_grade_average >= 1.00 AND min_grade_average <= 5.00),
  field_of_study TEXT,
  type_of_study TEXT CHECK (type_of_study IN(
        'Brucoš',
  		'Prijediplomski',
  		'Diplomski',
  		'Stručni',
	  	'Poslijediplomski doktorski',
		'Specijalistički diplomski stručni',
		'Poslijediplomski specijalistički')
		),	
  min_year_of_study INT CHECK (min_year_of_study IN(0,1,2,3,4,5)),
  length_of_scholarship INTERVAL NOT NULL,
  length_of_work INTERVAL,
  important_dates JSONB NOT NULL,
  organisation_id UUID NOT NULL REFERENCES user_organisation(user_id) ON DELETE CASCADE
);