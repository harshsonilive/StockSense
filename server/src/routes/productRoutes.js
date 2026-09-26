const express = require("express");

const {
    getProducts,
    createProduct,
    updateProduct
} = require("../controllers/productController");

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", getProducts);


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - unit_of_measure
 *             properties:
 *               name:
 *                 type: string
 *                 example: Steel Rods
 *               sku:
 *                 type: string
 *                 example: STL-001
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               unit_of_measure:
 *                 type: string
 *                 example: kg
 *               reorder_point:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: SKU already exists
 */
router.post("/", createProduct);


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put("/:id", updateProduct);

module.exports = router;