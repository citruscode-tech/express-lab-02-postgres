const request = require("supertest");
const { Pool } = require("pg");
const app = require("../server");

describe("Products API", () => {
  let pool;
  const testProduct = {
    name: "Test Product",
    price: 99.99,
    stock: 10,
  };

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT,
    });

    // Reset database state before test suite
    await pool.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");
    await pool.query(
      `INSERT INTO products (name, price, stock) 
       VALUES ('Wireless Mouse', 29.99, 50), 
              ('Mechanical Keyboard', 89.99, 25)`
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("GET /health", () => {
    it("should return database connection status", async () => {
      const response = await request(app).get("/health");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        status: "ok",
        database: "connected",
      });
    });
  });

  describe("GET /products", () => {
    it("should return all products", async () => {
      const response = await request(app).get("/products");
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe("GET /products/:id", () => {
    it("should return a specific product", async () => {
      const response = await request(app).get("/products/1");
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: expect.any(String),
        price: expect.any(Number),
      });
    });

    it("should return 404 for non-existent product", async () => {
      const response = await request(app).get("/products/999");
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: "Product not found" });
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app).get("/products/abc");
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: "Invalid product ID" });
    });
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const response = await request(app).post("/products").send(testProduct);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        ...testProduct,
      });

      // Verify database persistence
      const dbResult = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [response.body.id]
      );
      expect(dbResult.rows.length).toBe(1);
    });

    it("should return 400 for missing required fields", async () => {
      const badProducts = [
        { price: 10 }, // Missing name
        { name: "No Price" }, // Missing price
        { name: "", price: 10 }, // Empty name
      ];

      for (const body of badProducts) {
        const response = await request(app).post("/products").send(body);
        expect(response.statusCode).toBe(400);
      }
    });

    it("should enforce data validation rules", async () => {
      const badProducts = [
        { name: "A".repeat(256), price: 10 }, // Name too long
        { name: "Test", price: -5 }, // Negative price
        { name: "Test", price: 10, stock: -1 }, // Negative stock
      ];

      for (const body of badProducts) {
        const response = await request(app).post("/products").send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe("PUT /products/:id", () => {
    it("should update an existing product", async () => {
      const updates = { price: 79.99, stock: 30 };
      const response = await request(app).put("/products/1").send(updates);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(updates);
    });

    it("should handle partial updates", async () => {
      const updates = { stock: 15 };
      const response = await request(app).put("/products/2").send(updates);

      expect(response.statusCode).toBe(200);
      expect(response.body.stock).toBe(15);
      // Verify other fields remain unchanged
      expect(response.body.name).toBe("Mechanical Keyboard");
      expect(response.body.price).toBe(89.99);
    });

    it("should return 404 for non-existent product", async () => {
      const response = await request(app)
        .put("/products/999")
        .send({ price: 10 });

      expect(response.statusCode).toBe(404);
    });

    it("should validate update data", async () => {
      const badUpdates = [{ price: -10 }, { stock: -5 }, { name: "" }];

      for (const body of badUpdates) {
        const response = await request(app).put("/products/1").send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete an existing product", async () => {
      const response = await request(app).delete("/products/1");
      expect(response.statusCode).toBe(204);

      // Verify deletion
      const dbResult = await pool.query("SELECT * FROM products WHERE id = 1");
      expect(dbResult.rows.length).toBe(0);
    });

    it("should return 404 for non-existent product", async () => {
      const response = await request(app).delete("/products/999");
      expect(response.statusCode).toBe(404);
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app).delete("/products/abc");
      expect(response.statusCode).toBe(400);
    });
  });
});
