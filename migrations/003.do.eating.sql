BEGIN;

CREATE TYPE food_category AS ENUM (
    'bottle',
    'breast_fed',
    'formula'
);

CREATE TYPE feeding_sides AS ENUM (
    'left',
    'right'
);

CREATE TABLE eating (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    notes TEXT,
    duration time NOT NULL,
    food_type food_category,
    side_fed feeding_sides,
    child_id INTEGER REFERENCES children(id)
);

COMMIT;