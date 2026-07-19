### This is your guide for APIs I wrote.

- If the server goes down, or you just wanna take a glance at how the API structure looks, you can come here.

- I will be updating this file whenever I make changes to the API.

- But keep in mind that sometimes, I may forget to change this file.

- So if you encounter API problems that doesn't match the model I wrote here, you can contact me via telegram group chat.

- Don't worry, I deformed the payload for this register/login demo json :3

- I will be changing the register function based on feature requirements soon.

### Good Luck.

### 1. POST /api/auth/register

- It registers the user using the credentials given by the frontend.
- It only registers the user.
- Query Parameters -> (data) object that is like this { name, email, role, password }.

### Success Response

- Http Status Code (201)
- Content ->

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "b0207335-4995-4914-afe0-f8afc13ac45f",
    "name": "Shin Thant Aung",
    "email": "mgshinthant58@gmail.com",
    "role": "ADMIN"
  }
}
```

#

### 2. POST /api/auth/login

- It logs in the existing user.
- Query Parameters -> (data) object that is like this { email, password }

### Payload

```json
{
  "email": "mgshinthant61@gmail.com",
  "password": "12345678"
}
```

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

#

### 3. POST /api/food/upload

- It uploads food to the database.
- Query parameters are like this -> data object (name, description?, price) and file object
- Example code ->

```javascript

async createFood(data: foodType, file: Express.Multer.File) {
        const fileName = renameFile(file.originalname);
        const filepath = `images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pos-food-photo")
            .upload(filepath, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from("pos-food-photo")
            .getPublicUrl(filepath);

        const newFood = await prisma.food.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                photoUrl: publicUrlData.publicUrl
            }
        });

        return newFood;
    }

```

### Success Response

- HttpStatusCode (201)
- content ->

```json
{
  "status": "success",
  "message": "Food item created successfully",
  "data": {
    "id": "4ae151fd-cbe9-4f5a-a878-852e8dde27b6",
    "name": "Movie Snack",
    "description": null,
    "price": 25000,
    "photoUrl": "https://svaksufqqsjkfnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783356156110-re1s8n.png",
    "createdAt": "2026-07-06T16:42:40.067Z",
    "updatedAt": "2026-07-06T16:42:40.067Z"
  }
}
```

#

### 4. GET /api/food

- It fetches the food items using pagination and caching.

### Success Response

```json
{
  "status": "success",
  "message": "food fetched successfully",
  "foods": [
    {
      "id": "c4b34d47-7361-493f-8eaa-70c65828ed46",
      "name": "ပလာတာ အကြီး",
      "description": null,
      "price": 25000,
      "photoUrl": "https://svaksufqqkssrmtnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783402460194-zi5obg.png",
      "createdAt": "2026-07-07T05:34:21.869Z",
      "updatedAt": "2026-07-07T05:34:21.869Z"
    },
    {
      "id": "4ae151fd-cbe9-4f5a-a878-852e8dde27b6",
      "name": "Movie Snack",
      "description": null,
      "price": 25000,
      "photoUrl": "https://svaksufqqrmsfsdfstnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783356156110-re1s8n.png",
      "createdAt": "2026-07-06T16:42:40.067Z",
      "updatedAt": "2026-07-06T16:42:40.067Z"
    },
    {
      "id": "58633b25-cfa2-4079-a49f-af11bb4e4fac",
      "name": "Normal Food",
      "description": null,
      "price": 10000,
      "photoUrl": "https://svaksufqqsdfsfermtnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783347306464-dahok8.png",
      "createdAt": "2026-07-06T14:15:07.904Z",
      "updatedAt": "2026-07-06T14:15:07.904Z"
    }
  ],
  "meta": {
    "totalItems": 3,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10
  }
}
```

### 5. PUT /api/food/:id/update

- This route updates the food
- It accepts id, data object (name, description?, price) and file object

### Success Response

```json
{
  "status": "success",
  "message": "Food item updated successfully",
  "data": {
    "id": "c4b34d47-7361-493f-8eaa-70c65828ed46",
    "name": "ပလာတာ အသေး",
    "description": null,
    "price": 2500,
    "photoUrl": "https://svaksufqqskdjfwjefjrmtnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783410142937-zoigkm.png",
    "createdAt": "2026-07-07T05:34:21.869Z",
    "updatedAt": "2026-07-07T07:42:24.958Z"
  }
}
```

### 6. GET /api/food/deleted

- This route gets deleted foods.

### Success Response

```json
{
  "status": "success",
  "message": "food fetched successfully",
  "deletedFoods": [
    {
      "id": "c4b34d47-7361-493f-8eaa-70c65828ed46",
      "name": "ပလာတာ အကြီး",
      "description": null,
      "price": 25000,
      "photoUrl": "https://svaksufqqkssrmtnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783402460194-zi5obg.png",
      "createdAt": "2026-07-07T05:34:21.869Z",
      "updatedAt": "2026-07-07T05:34:21.869Z"
    },
    {
      "id": "4ae151fd-cbe9-4f5a-a878-852e8dde27b6",
      "name": "Movie Snack",
      "description": null,
      "price": 25000,
      "photoUrl": "https://svaksufqqrmsfsdfstnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783356156110-re1s8n.png",
      "createdAt": "2026-07-06T16:42:40.067Z",
      "updatedAt": "2026-07-06T16:42:40.067Z"
    },
    {
      "id": "58633b25-cfa2-4079-a49f-af11bb4e4fac",
      "name": "Normal Food",
      "description": null,
      "price": 10000,
      "photoUrl": "https://svaksufqqsdfsfermtnttjyesr.supabase.co/storage/v1/object/public/pos-food-photo/images/1783347306464-dahok8.png",
      "createdAt": "2026-07-06T14:15:07.904Z",
      "updatedAt": "2026-07-06T14:15:07.904Z"
    }
  ],
  "meta": {
    "totalItems": 3,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10
  }
}
```

### 7. DELETE /api/food/:id/delete

- This deletes specific food
- It accepts id as parameter in req.params

### Success Response

```json
{
  "status": "success",
  "message": "Food was soft deleted successfully",
  "data": {
    "count": 1
  }
}
```

### 8. DELETE /api/food/bulk/delete

- This deletes selected foods
- It accepts ids from req.body.

### Success Response

```json
{
  "status": "success",
  "message": "5 items soft deleted successfully",
  "data": {
    "count": 5
  }
}
```

### 9. PUT /api/food/bulk/restore

- This restores selected deleted foods.
- It accepts ids from req.body.

### Success Response

```json
{
  "status": "success",
  "message": "5 items restored successfully",
  "data": {
    "count": 5
  }
}
```

### 10. GET /api/table

- This route fetches tables

### Success Response

```json
{
  "status": "success",
  "message": "Tables fetched successfully.",
  "tables": [
    {
      "id": "546129d9-2562-47c6-be30-3ab96aca2b57",
      "name": "Table 11",
      "createdAt": "2026-07-08T16:11:36.310Z"
    },
    {
      "id": "eb061669-1437-479d-9c48-6f1b27848f60",
      "name": "Table 10",
      "createdAt": "2026-07-08T16:11:29.904Z"
    },
    {
      "id": "dbd8b7bd-4680-41dd-9fdf-6588d65abcf8",
      "name": "Table 9",
      "createdAt": "2026-07-08T16:09:19.199Z"
    },
    {
      "id": "964f5305-9dba-4f75-8f05-3b798d6cdcaa",
      "name": "Table 8",
      "createdAt": "2026-07-08T16:09:14.174Z"
    },
    {
      "id": "9fd215a4-1897-4e60-9d2c-6f8271754fbf",
      "name": "Table 7",
      "createdAt": "2026-07-08T16:09:08.033Z"
    },
    {
      "id": "03ced2fa-5004-469e-975f-ab91453fec34",
      "name": "Table 6",
      "createdAt": "2026-07-08T16:09:03.545Z"
    },
    {
      "id": "51f9772f-6f08-4a16-ac51-a1b0bc40066e",
      "name": "Table 5",
      "createdAt": "2026-07-08T16:08:56.564Z"
    },
    {
      "id": "35a20544-081d-494a-9b04-4ef8599ce7fe",
      "name": "Table 4",
      "createdAt": "2026-07-08T16:08:52.127Z"
    },
    {
      "id": "afc4d73a-a630-4077-8313-b36567fd5edf",
      "name": "Table 3",
      "createdAt": "2026-07-08T16:08:48.782Z"
    },
    {
      "id": "c35a3601-3a7d-47d7-bd25-82cf7cf7a687",
      "name": "Table 2",
      "createdAt": "2026-07-08T16:08:37.212Z"
    }
  ],
  "meta": {
    "totalItems": 11,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 10
  }
}
```

### 11. POST /api/table

- This route creates tables.
- The route accepts request.body which contains { name }.

### Success Response

```json
{
  "status": "success",
  "message": "Table created successfully.",
  "data": {
    "id": "8bc9d87b-94bf-4f20-b0b2-aab8214a0df3",
    "name": "Table 12",
    "createdAt": "2026-07-08T16:26:57.641Z"
  }
}
```

### 12. DELETE /api/table

- This route deletes tables.
- The route accepts request.body which contains { ids } which is an array of ids.

### Success Response

```json
{
  "status": "success",
  "message": "1 tables has been deleted.",
  "data": {
    "count": 1
  }
}
```

### 13. GET /api/users

- This route is restricted only for admins.
- It fetches lists of all users.

### Success Response

```json
{
  "status": "success",
  "message": "Users fetched successfully",
  "users": [
    {
      "id": "a38a724c-4b06-420d-8510-0ca268e8e951",
      "name": "Cashier Koko Shin",
      "email": "mgshinthant56@gmail.com",
      "role": "CASHIER",
      "password": "$2b$10$YHZBXEc0vXhXJuH79arDwugUWOrOCU0IsE0pUteO./MxiOToDBsRS",
      "createdAt": "2026-07-07T07:35:12.689Z",
      "updatedAt": "2026-07-07T07:35:12.689Z"
    },
    {
      "id": "b0207335-4995-4914-afe0-f8afc13ac45f",
      "name": "Shin Thant Aung",
      "email": "mgshinthant58@gmail.com",
      "role": "ADMIN",
      "password": "$2b$10$FQBCMIz5r1zNGMvfnc.5XeRA53.3N2F4fwI5X.QkhAu2T3jLnwuV6",
      "createdAt": "2026-07-06T03:34:15.969Z",
      "updatedAt": "2026-07-06T03:34:15.969Z"
    }
  ],
  "meta": {
    "totalItems": 2,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10
  }
}
```

### Unauthenticated Response

```json
{
  "status": "unauthenticated",
  "message": "Your session has expired. Please log in again."
}
```

### Example Role Forbidden Response

```json
{
  "status": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

### 14. POST /api/users/create

- This route creates a user.
- Only admins are allowed to use this route.

### Payload

```json
{
  "name": "Ko Kyaw Zaw Aung",
  "email": "mgshinthant61@gmail.com",
  "password": "12345678",
  "role": "CASHIER"
}
```

### Success Response

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "61a8c8c7-96be-40b4-b58f-7b8581751368",
    "name": "Ko Kyaw Zaw Aung",
    "email": "mgshinthant61@gmail.com",
    "role": "CASHIER"
  }
}
```

### Example error json

```json
{
  "error": "Email already exists"
}
```

### 15. GET /api/users/:id

- This route is only for admins.
- This route shows individual users based on their id.

### Success Response

```json
{
  "status": "success",
  "message": "User fetched successfully",
  "user": {
    "name": "Ko Kyaw Zaw Aung",
    "email": "mgshinthant61@gmail.com",
    "role": "CASHIER",
    "profilePicture": null
  }
}
```

### Example Role Forbidden Response

```json
{
  "status": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

### 16. PUT /api/users/:id/edit

- This route is only for admins.
- This route allows an admin to edit a user's data.

### Payload

- Params - id

#### Request Body (multipart/form-data)

| Field      | Type   | Required | Description                           |
| :--------- | :----- | :------- | :------------------------------------ |
| `name`     | string | Optional | New name for the user                 |
| `email`    | string | Optional | New email for the user                |
| `password` | string | Optional | New password                          |
| `image`    | file   | Optional | Profile picture file (PNG, JPG, etc.) |

```json
{
  "email": "mgshinthant77@gmail.com",
  "password": "12345678"
}
```

- or

```json
{
  "email": "mgshinthant77@gmail.com"
}
```

- or

```json
{
  "password": "12345678"
}
```

### Example Role Forbidden Response

```json
{
  "status": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

### 17. DELETE /api/users/delete

- This route is only for admins
- This allows admins to delete user accounts in bulk, or individually.

### Payload

```json
{
  "ids": [
    "61a8c8c7-96be-40b4-b58f-7b8581751368",
    "61a8c8c8-96be-40b4-b58f-7b8581751368",
    "61a8c8c9-96be-40b4-b58f-7b8581751368"
  ]
}
```

### Success Response

```json
{
  "status": "success",
  "message": "2 users deleted successfully",
  "data": {
    "count": 2
  }
}
```

### Example Role Forbidden Response

```json
{
  "status": "forbidden",
  "message": "You do not have permission to perform this action."
}
```
