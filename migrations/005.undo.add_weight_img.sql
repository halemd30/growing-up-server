BEGIN;

ALTER TABLE children DROP COLUMN IF EXISTS weight;
ALTER TABLE children DROP COLUMN IF EXISTS image;

COMMIT;