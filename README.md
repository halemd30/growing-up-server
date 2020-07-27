# Growing Up Server

This is the api for our capstone project, called Growing Up.

## Live App

Deployed App: 

## Summary


## Technology Used

Front End: HTML, CSS, JavaScript, React
<br />
Back End: Node, Express, PostresSQL

## API Documentation

### Authentication

GrowingUp uses JWT tokens, required on the children, eating, and sleeping endpoint requests. The tokens are created upon a users login and sent in the response body.

# API Endpoints:

<!-- contract - whats required from the frontend -->
## /

-   This endpoint allows you to test your connection to the server. It will send a response containing 'The good stuff' if you have connected sucessfully. It is not protected.

## /api/users endpoint:

### POST '/'

required:

- first_name (string)
- last_name (string)
- username (string)
  - must be unique
- password (string)
  - must include:
    - at least 8 and less than 72 characters
    - can't start with or end with spaces
    - at least 1 uppercase, 1 lowercase, and 1 number

returns 201 adding user to the database

## /api/auth endpoint

### POST '/login'

required:

- username (string)
- password (string)

returns JWT

## /api/children endpoints:

### GET '/'

returns all children for a specific user

### POST '/'

required:

- first_name (string)
- age (integer)

returns 201 adding child to the database

### GET '/:childrenId'

returns specific child data

### DELETE '/:childrenId'

removes specific child from database

### PATCH '/:childrenId'

required:

- change at least 1 value for name and age
  returns the updated child's name and age

## /api/eating endpoints:

### GET '/'

returns meal data for all children

### GET '/:childId'

returns meal data for a specific child

### POST '/:childId'

required:

- duration (time or integer?)
- food_type (enum)
- side_fed (string)
  optional:
- notes (string)

returns meal data

### DELETE '/:mealId'

removes specific meal from database

### PATCH '/:mealId'

returns meal duration, food_type, and side_fed when 'stop' button is hit

## /api/sleeping endpoints:

### GET '/'

returns sleep data for all children

### GET '/:childId'

returns sleep data for a specific child

### POST '/:childId'

required:

- duration (time or integer?)
- sleep_type (enum)
- sleep_category (enum)
  optional:
- notes (string)

returns sleep data

### DELETE '/:sleepId'

removes specific sleep data from database

### PATCH '/:sleepId

returns sleep duration, sleep_type, and sleep_category when 'stop' button is hit

## Screenshots
