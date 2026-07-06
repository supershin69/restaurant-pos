### This is your guide for APIs I wrote.

- If the server goes down, or you just wanna take a glance at how the API structure looks, you can come here.

- I will be updating this file whenever I make changes to the API.

- But keep in mind that sometimes, I may forget to change this file.

- So if you encounter API problems that doesn't match the model I wrote here, you can contact me via telegram group chat.

- Don't worry, I deformed the payload for this register/login demo json :3

- I will be changing the register function based on feature requirements soon.

# Good Luck.

### 1. /api/auth/register

- It registers the user using the credentials given by the frontend.
- Query Parameters -> (data) object that is like this { name, email, role, password }.

### Success Response

- Http Status Code (201)
- Content ->

```json
{
  "status": "success",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYTM4MGJhYy1lMzE1LTRjdjrjojeijoeoyYzBjZDc4MTVhYjgiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODMzMDQ4NjMsImV4cCI6MTc4MzM0ODA2M30.bkIXkJAEAZ_IoI3xX91wJhrAnoAQOy4ccBUmoWppc38",
  "data": {
    "id": "ca380bac-e315-4c02-8370-2c0cd7815ab8",
    "name": "Shin Thant Aung",
    "email": "mgshinthant57@gmail.com",
    "role": "ADMIN"
  }
}
```

### 2. /api/auth/login

- It logs in the existing user.
- Query Parameters -> (data) object that is like this { email, password }

### Success Response

- Http Status Code (200)
- Content ->

```json
{
  "status": "success",
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZDY2ZjI5ZC1iNzVllkdjoroejrkooQzZi04NzZkMmNkZDBmZjgiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODMzMDUxMTIsImV4cCI6MTc4MzM0ODMxMn0.iZWxoc3xs5j0vW0E2rE9xO72xkBfNw6Jc1-ARediESk",
  "data": {
    "id": "8d66f29d-b75e-4bbf-8d3f-876d2cdd0ff8",
    "name": "Shin Thant Aung",
    "email": "mgshinthant58@gmail.com",
    "role": "ADMIN"
  }
}
```
