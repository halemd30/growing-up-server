BEGIN;

ALTER TABLE eating 
DROP CONSTRAINT eating_child_id_fkey,
ADD CONSTRAINT child_id FOREIGN KEY (child_id) REFERENCES children(id);

ALTER TABLE sleeping 
DROP CONSTRAINT sleeping_child_id_fkey,
ADD CONSTRAINT child_id FOREIGN KEY (child_id) REFERENCES children(id);

COMMIT;