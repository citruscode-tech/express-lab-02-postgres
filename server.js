require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
const PORT = 3000;

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
});

// Health Check Endpoint
app.get("/health", async (req, res) => {
  const health = req
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.get("/", (req, res) => {
  res
    .json({
      "Express & Postgres Lab - Home Page":
        "Welcome to the Express & Postgres Lab!",
    })
    .status(200);
});

// 🎯 STUDENT TASKS: Implement these routes
// ------------------------------------------------

// GET all products
app.get("/products", async (req, res) => {
  const products = await pool.query("select * from products")
  res.send(products.rows)
});

// GET single product
app.get("/products/:id", async (req, res) => {
  // TODO: 1. Get ID from params
  //Destructure req.param object to extract req.param.id 
  //Preferable version for deeply nested object
  const {params: {id}} = req;
  //Alternative version
  //const {productId} = req.params;
  //       2. Query database
  try {
    const product = await pool.query(`Select * from products where id = ${id}`)
  //       3. Handle not found case
    const {rows} = product
      console.log(rows) 
    if(rows.length > 0) {
      res.send(rows[0])
    } else {
      res.status(404).json({error: "Product not found"})
    }
  } catch(err) {
    res.status(400).json({error: "Invalid product ID"})
  }
  
});

// POST create product
app.post("/products", async (req, res) => {
  // TODO: 1. Validate required fields (name, price)
  //       2. Insert into database
  //       3. Return new product
});

// PUT update product
app.put("/products/:id", async (req, res) => {
  // TODO: 1. Get ID from params
  //       2. Validate inputs
  //       3. Update database
});

// DELETE product
app.delete("/products/:id", async (req, res) => {
  // TODO: 1. Delete from database
  //       2. Handle success/failure
});

// ------------------------------------------------
// 🚫 Do not modify below this line

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
