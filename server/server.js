const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./src/config/db");

const app = express();
const productRoutes = require("./src/routes/productRoutes");
const warehouseRoutes = require("./src/routes/warehouseRoutes");
const stockRoutes = require("./src/routes/stockRoutes");
const receiptRoutes = require("./src/routes/receiptRoutes");
const deliveryRoutes = require("./src/routes/deliveryRoutes");
const transferRoutes = require("./src/routes/transferRoutes");
const adjustmentRoutes =
    require("./src/routes/adjustmentRoutes");


app.use(cors());
app.use(express.json());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);



app.get("/", (req, res) => {
    res.json({
        message: "StockSense API is running"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS connected");

        res.json({
            status: "ok",
            database: rows[0].connected === 1
                ? "connected"
                : "disconnected"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`StockSense API running on http://localhost:${PORT}`);
});