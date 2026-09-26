const express = require("express");

const {
    createAdjustment
} = require("../controllers/adjustmentController");

const router = express.Router();

/**
 * @swagger
 * /api/adjustments:
 *   post:
 *     summary: Adjust inventory quantity
 *     tags:
 *       - Adjustments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - warehouse_id
 *               - quantity_change
 *               - reason
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               warehouse_id:
 *                 type: integer
 *                 example: 1
 *               quantity_change:
 *                 type: number
 *                 example: -5
 *               reason:
 *                 type: string
 *                 example: Physical stock count correction
 *     responses:
 *       201:
 *         description: Stock adjustment completed
 *       400:
 *         description: Invalid adjustment
 */
router.post("/", createAdjustment);

module.exports = router;