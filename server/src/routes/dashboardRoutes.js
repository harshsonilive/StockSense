const express = require("express");

const {
    getDashboardSummary,
    getRecentMovements
} = require("../controllers/dashboardController");

const router = express.Router();


/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Dashboard summary
 */
router.get("/summary", getDashboardSummary);


/**
 * @swagger
 * /api/dashboard/recent-movements:
 *   get:
 *     summary: Get recent stock movements
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Recent stock movements
 */
router.get(
    "/recent-movements",
    getRecentMovements
);


module.exports = router;