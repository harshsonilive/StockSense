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
 *   get:
 *     summary: Get all stock transfers
 *     tags:
 *       - Transfers
 *     responses:
 *       200:
 *         description: List of stock transfers
 */
router.get("/", getTransfers);


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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transfer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Transfer validated successfully
 *       400:
 *         description: Transfer cannot be validated
 *       404:
 *         description: Transfer not found
 */
router.post("/:id/validate", validateTransfer);


module.exports = router;