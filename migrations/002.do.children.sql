CREATE TABLE children (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    image TEXT,
    weight DECIMAL(5,2),
    age int NOT NULL,
    user_id INTEGER REFERENCES users(id)
);

