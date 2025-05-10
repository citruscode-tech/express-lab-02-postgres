# Express Lab 2: PostgreSQL CRUD - Products API

## 📋 Prereqs:

1. Install PostgreSQL

   - [Windows/Mac Guide](https://www.postgresql.org/download/)
   - Verify installation:

   ```bash
   psql --version  # Should show 14.x+
   ```

2. ### **Database Setup Guide**

   1. Create PostgreSQL Role (If Missing)

      ```bash
      psql -d template1 -c "CREATE ROLE postgres WITH SUPERUSER LOGIN;"
      ```

   2. Create Database

      ```bash
      createdb -U postgres inventory
      ```

   3. Create Products Table

      ```bash
      psql -U postgres -d inventory -c "
      CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) CHECK (price >= 0),
      stock INTEGER DEFAULT 0 CHECK (stock >= 0)
      );"
      ```

   4. Seed Sample Data

      ```bash
      # After creating the database
      psql -U postgres -d inventory -f seed.sql
      ```

### ✅ Verification Commands

```bash
# Check database connection
psql -U postgres -d inventory -c "SELECT 1 AS connection_test;"

# Verify table structure
psql -U postgres -d inventory -c "\d products"

# View seed data
psql -U postgres -d inventory -c "SELECT * FROM products;"
```

### Important Documentation

- [Express Routing](https://expressjs.com/en/guide/routing.html)
- [Postman Request](https://learning.postman.com/docs/sending-requests/create-requests/request-basics/)
- [Rest API Concepts](https://www.restapitutorial.com/introduction/httpmethods)
- [Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [Postgres Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html)

## 🛠️ Setup Instructions:

1.  Fork Starter Code
2.  Clone your Forked Repo Code
3.  Install Dependencies:

    ```bash
    npm install
    ```

4.  Configure Environment (create **.env** file)

    ```bash
    PG_HOST=localhost
    PG_USER=postgres
    PG_PASSWORD=password
    PG_DATABASE=inventory
    PG_PORT=5432
    ```

## 🚀 Running the Server

1. Development Mode (Auto-restart)

   ```bash
   npm run dev
   ```

   - You should see:

   ```bash
   > nodemon server.js
   [nodemon] starting `node server.js`
   Server running on http://localhost:3000
   ```

## 🎯 Lab Objectives

1. Implement basic CRUD operations for products
2. Use parameterized SQL queries
3. Handle database errors
4. Validate request data

## 📝 Lab Tasks

### Task 1: Health Check Endpoint

- Create GET **/health** endpoint
- Return JSON:
  ```json
  {
    "status": "ok",
    "database": "connected"
  }
  ```
- Verify PostgreSQL connection using **SELECT 1** query

### Task 2: Product Routes

1. GET **/products**
   - Return all products from database as JSON array:
     ```json
     [
       {
         "id": 1,
         "name": "Wireless Mouse",
         "price": 29.99,
         "stock": 50
       },
       {
         "id": 2,
         "name": "Mechanical Keyboard",
         "price": 89.99,
         "stock": 25
       }
     ]
     ```
2. GET **/products/:id**
   - Return specific product by ID:
     ```json
     {
       "id": 1,
       "name": "Wireless Mouse",
       "price": 29.99,
       "stock": 50
     }
     ```
   - Return 404 with JSON error if not found:
     ```json
     { "error": "Product not found" }
     ```

### Task 3: Product Management

1. POST **/products**

   - Accept JSON:

   ```json
   {
     "name": "New Product",
     "price": 19.99,
     "stock": 100
   }
   ```

   - Validate required fields **(name, price)**
   - Return 400 error if validation fails
   - Return created product with 201 status:

   ```json
   {
     "id": 3,
     "name": "New Product",
     "price": 19.99,
     "stock": 100
   }
   ```

2. PUT **/products/:id**
   - Update existing product
   - Accept partial updates (e.g., just price or stock)
   - Return updated product:
   ```json
   {
     "id": 3,
     "name": "Updated Product",
     "price": 24.99,
     "stock": 80
   }
   ```
3. DELETE **/products/:id**

- Delete product from database
- Return 204 No Content on success

## 🧪 Postman Testing Guide

Collection Setup

1. Open Postman
2. Create new collection: Express Routing Lab
3. Add these requests:
   - **GET** http://localhost:3000/health (Verify database connection)
   - **GET** http://localhost:3000/products (Empty array vs populated results)
   - **GET** http://localhost:3000/products/999 (404 error response)
   - **POST** http://localhost:3000/products (Missing name/price → 400 error)
   - **POST** http://localhost:3000/products/1 (Update price only)
   - **DELETE** http://localhost:3000/products/1 (Verify deletion with GET after)
