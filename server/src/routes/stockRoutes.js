const express = require("express");

const {
    getStock
} = require("../controllers/stockController");

const router = express.Router();

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Get current stock levels
 *     tags:
 *       - Stock
 *     responses:
 *       200:
 *         description: Current stock levels
 */
router.get("/", getStock);

module.exports = router;