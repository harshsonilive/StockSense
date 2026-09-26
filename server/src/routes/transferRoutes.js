const express = require("express");

const {
    getTransfers,
    createTransfer,
    validateTransfer
} = require("../controllers/transferController");

const router = express.Router();

/**
 * @swagger
 * /api/transfers:
 *   post:
 *     summary: Create a stock transfer
 *     tags:
 *       - Transfers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference_no
 *               - from_warehouse_id
 *               - to_warehouse_id
 *               - items
 *             properties:
 *               reference_no:
 *                 type: string
 *                 example: TRF-001
 *               from_warehouse_id:
 *                 type: integer
 *                 example: 1
 *               to_warehouse_id:
 *                 type: integer
 *                 example: 2
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: number
 *                       example: 20
 *     responses:
 *       201:
 *         description: Transfer created successfully
 *       400:
 *         description: Invalid transfer data
 *       409:
 *         description: Reference number already exists
 */
router.post("/", createTransfer);


/**
 * @swagger
 * /api/transfers/{id}/validate:
 *   post:
 *     summary: Validate a stock transfer
 *     tags:
 *       - Transfers
 */
router.post("/:id/validate", validateTransfer);

module.exports = router;