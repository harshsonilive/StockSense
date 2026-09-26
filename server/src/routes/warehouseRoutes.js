const express = require("express");

const {
    getWarehouses,
    createWarehouse
} = require("../controllers/warehouseController");

const router = express.Router();

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Get all warehouses and locations
 *     tags:
 *       - Warehouses
 *     responses:
 *       200:
 *         description: List of warehouses
 */
router.get("/", getWarehouses);


/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Create a warehouse or location
 *     tags:
 *       - Warehouses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Main Warehouse
 *               type:
 *                 type: string
 *                 example: Warehouse
 *               parent_location_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 */
router.post("/", createWarehouse);

module.exports = router;