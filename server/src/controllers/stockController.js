const pool = require("../config/db");

const getStock = async (req, res) => {
    try {
        const [stock] = await pool.query(`
            SELECT
                s.id,
                p.id AS product_id,
                p.name AS product,
                p.sku,
                w.id AS warehouse_id,
                w.name AS warehouse,
                s.quantity,
                p.unit_of_measure,
                p.reorder_point,

                CASE
                    WHEN s.quantity = 0 THEN 'OUT_OF_STOCK'
                    WHEN s.quantity <= p.reorder_point THEN 'LOW_STOCK'
                    ELSE 'IN_STOCK'
                END AS stock_status

            FROM stock_levels s

            INNER JOIN products p
                ON s.product_id = p.id

            INNER JOIN warehouses w
                ON s.warehouse_id = w.id

            ORDER BY p.name ASC
        `);

        res.json(stock);

    } catch (error) {
        console.error("Get stock error:", error);

        res.status(500).json({
            message: "Failed to fetch stock"
        });
    }
};


module.exports = {
    getStock
};