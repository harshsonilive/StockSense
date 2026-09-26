const express = require("express");

const {
    getReceipts,
    createReceipt,
    validateReceipt
} = require("../controllers/receiptController");

const router = express.Router();

/**
 * @swagger
 * /api/receipts:
 *   get:
 *     summary: Get all receipts
 *     tags:
 *       - Receipts
 *     responses:
 *       200:
 *         description: List of receipts
 */
router.get("/", getReceipts);


/**
 * @swagger
 * /api/receipts:
 *   post:
 *     summary: Create a stock receipt
 *     tags:
 *       - Receipts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference_no
 *               - warehouse_id
 *               - items
 *             properties:
 *               reference_no:
 *                 type: string
 *                 example: REC-001
 *               supplier:
 *                 type: string
 *                 example: ABC Metals
 *               warehouse_id:
 *                 type: integer
 *                 example: 1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: number
 *                       example: 50
 *     responses:
 *       201:
 *         description: Receipt created successfully
 */
router.post("/", createReceipt);


/**
 * @swagger
 * /api/receipts/{id}/validate:
 *   post:
 *     summary: Validate a receipt and increase stock
 *     tags:
 *       - Receipts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Receipt validated successfully
 *       400:
 *         description: Receipt cannot be validated
 *       404:
 *         description: Receipt not found
 */
router.post("/:id/validate", validateReceipt);

module.exports = router;