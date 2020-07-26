BEGIN;

TRUNCATE
  sleeping,
  eating,
  children,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (first_name, last_name, username, password)
    VALUES
        ('test', 'user', 'test_w', 'cool_password'),
        ('other', 'person', 'other_test', 'other_password');

INSERT INTO children (first_name, age, user_id)
    VALUES
        ('liam', '2', 1),
        ('emma', '5', 1),
        ('olivia', '8', 2);

INSERT INTO eating (notes, duration, food_type, side_fed, child_id)
    VALUES
        ('testing notes - good eating', '00:28:12', 'bottle', '', 2),
        ('didnt eat well', '00:12:56', 'breast_fed', 'left', 3),
        ('', '00:34:35', 'formula', '', 2),
        ('', '00:37:22', 'formula', '', 1),
        ('good session', '00:45:23', 'breast_fed', 'right', 3);

INSERT INTO sleeping (notes, duration, sleep_type, sleep_category, child_id)
    VALUES
        ('stomach', '02:34:55', 'calm', 'nap', 2),
        ('rolled over three times', '04:55:08', 'restless', 'bedtime', 3),
        ('', '03:45:36', 'crying', 'bedtime', 1);

COMMIT;