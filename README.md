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

GrowingUp uses JWT tokens, required on the children, eating, and sleeping endpoint requests. The tokens are created upon a users login and sent in the response body. All protected endpoints pull user_id from the JWT token give at login, and only return data specific to that user.

# API Endpoints:

<!-- contract - whats required from the frontend -->
## '/'

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

required: 
- childrenId, passed as a string parameter

returns specific child data

### DELETE '/:childrenId'

required: 
- childrenId, passed as a string parameter

removes specific child from database

### PATCH '/:childrenId'

required:
- childrenId, passed as a string parameter
- change at least 1 value for first_name and age

returns the updated child's first_name and age

## /api/eating endpoints:

### GET '/all/:childId'

required: 
- childId, passed as a string parameter
returns all meal data for a specific child

### POST '/all/:childId'

required:
- childId - passed as a string parameter
- duration (time)
- food_type (enum: 'bottle', 'breast_fed', 'formula')
optional:
- side_fed (string)
- notes (string)

returns meal data created

### DELETE '/:mealId'

required: 
- mealId, passed as a string parameter
removes specific meal from database

### PATCH '/:mealId'

required: 
- childId, passed as a string parameter
- one of the values (notes, duration, food_type, side_fed) must be changed

returns 201 and updates

## /api/sleeping endpoints:

### GET '/all/:childId'

required: 
- childId, passed as a string parameter
returns all sleep data for a specific child

### GET '/:sleepId'

required: 
- sleepId, passed as a string parameter
returns sleep data for a specific child

### POST '/all/:childId'

required:
- childId, passed as a string parameter
- duration (time)
- sleep_type (enum: 'crying','restless','calm')
- sleep_category (enum: 'nap','bedtime')
optional:
- notes (string)

returns new sleep data

### DELETE '/:sleepId'

required: 
- sleepId, passed as a string parameter
removes specific sleep data from database

### PATCH '/:sleepId

required: 
- sleepId, passed as a string parameter
- one of the values (notes, duration, sleep_type, sleep_category) must be changed

returns 201 and updates

## Screenshots
