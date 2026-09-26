const pool = require("../config/db");


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

const getDashboardSummary = async (req, res) => {
    try {

        // Total products
        const [productRows] = await pool.query(`
            SELECT COUNT(*) AS total_products
            FROM products
        `);


        // Total warehouses
        const [warehouseRows] = await pool.query(`
            SELECT COUNT(*) AS total_warehouses
            FROM warehouses
        `);


        // Total stock
        const [stockRows] = await pool.query(`
            SELECT COALESCE(SUM(quantity), 0) AS total_stock_units
            FROM stock_levels
        `);


        // Low stock
        const [lowStockRows] = await pool.query(`
            SELECT COUNT(*) AS low_stock_products
            FROM stock_levels s
            INNER JOIN products p
                ON s.product_id = p.id
            WHERE s.quantity > 0
              AND s.quantity <= p.reorder_point
        `);


        // Out of stock
        const [outOfStockRows] = await pool.query(`
            SELECT COUNT(*) AS out_of_stock_products
            FROM stock_levels
            WHERE quantity <= 0
        `);


        // Pending receipts
        const [pendingReceiptRows] = await pool.query(`
            SELECT COUNT(*) AS pending_receipts
            FROM receipts
            WHERE status = 'PENDING'
        `);


        // Pending deliveries
        const [pendingDeliveryRows] = await pool.query(`
            SELECT COUNT(*) AS pending_deliveries
            FROM deliveries
            WHERE status = 'PENDING'
        `);


        // Pending transfers
        const [pendingTransferRows] = await pool.query(`
            SELECT COUNT(*) AS pending_transfers
            FROM transfers
            WHERE status = 'PENDING'
        `);


        res.json({
            total_products: Number(productRows[0].total_products),

            total_warehouses:
                Number(warehouseRows[0].total_warehouses),

            total_stock_units:
                Number(stockRows[0].total_stock_units),

            low_stock_products:
                Number(lowStockRows[0].low_stock_products),

            out_of_stock_products:
                Number(outOfStockRows[0].out_of_stock_products),

            pending_receipts:
                Number(pendingReceiptRows[0].pending_receipts),

            pending_deliveries:
                Number(pendingDeliveryRows[0].pending_deliveries),

            pending_transfers:
                Number(pendingTransferRows[0].pending_transfers)
        });

    } catch (error) {

        console.error(
            "Dashboard summary error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch dashboard summary"
        });
    }
};


// =====================================================
// RECENT STOCK MOVEMENTS
// =====================================================

const getRecentMovements = async (req, res) => {
    try {

        const [movements] = await pool.query(`
            SELECT
                sl.id,
                sl.movement_type,
                sl.quantity_change,
                sl.quantity_before,
                sl.quantity_after,
                sl.reference_type,
                sl.reference_id,
                sl.created_at,

                p.name AS product,
                p.sku,

                w.name AS warehouse

            FROM stock_ledger sl

            INNER JOIN products p
                ON sl.product_id = p.id

            INNER JOIN warehouses w
                ON sl.warehouse_id = w.id

            ORDER BY sl.id DESC

            LIMIT 10
        `);


        res.json(movements);

    } catch (error) {

        console.error(
            "Recent movements error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch recent movements"
        });
    }
};


module.exports = {
    getDashboardSummary,
    getRecentMovements
};