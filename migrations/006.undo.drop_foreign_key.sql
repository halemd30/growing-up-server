BEGIN;

ALTER TABLE eating 
DROP CONSTRAINT child_id,
ADD CONSTRAINT child_id FOREIGN KEY (child_id) REFERENCES children(id);

ALTER TABLE sleeping 
DROP CONSTRAINT child_id,
ADD CONSTRAINT child_id FOREIGN KEY (child_id) REFERENCES children(id);

COMMIT;