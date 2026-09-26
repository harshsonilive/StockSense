const express = require("express");

const {
    getDeliveries,
    createDelivery,
    validateDelivery
} = require("../controllers/deliveryController");

const router = express.Router();

/**
 * @swagger
 * /api/deliveries:
 *   get:
 *     summary: Get all deliveries
 *     tags:
 *       - Deliveries
 *     responses:
 *       200:
 *         description: List of deliveries
 */
router.get("/", getDeliveries);


/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Create a delivery
 *     tags:
 *       - Deliveries
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
 *                 example: DEL-001
 *               customer:
 *                 type: string
 *                 example: XYZ Manufacturing
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
 *                       example: 20
 *     responses:
 *       201:
 *         description: Delivery created successfully
 */
router.post("/", createDelivery);


/**
 * @swagger
 * /api/deliveries/{id}/validate:
 *   post:
 *     summary: Validate delivery and decrease stock
 *     tags:
 *       - Deliveries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Delivery validated successfully
 *       400:
 *         description: Insufficient stock or invalid delivery
 *       404:
 *         description: Delivery not found
 */
router.post("/:id/validate", validateDelivery);

module.exports = router;