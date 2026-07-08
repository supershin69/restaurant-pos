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
