const pool = require("../config/db");

const createAdjustment = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            product_id,
            warehouse_id,
            quantity_change,
            reason
        } = req.body;

        if (
            !product_id ||
            !warehouse_id ||
            quantity_change === undefined ||
            !reason
        ) {
            return res.status(400).json({
                message:
                    "Product, warehouse, quantity change and reason are required"
            });
        }

        const change = Number(quantity_change);

        if (!Number.isFinite(change) || change === 0) {
            return res.status(400).json({
                message:
                    "Quantity change must be a valid non-zero number"
            });
        }

        await connection.beginTransaction();

        const [stockRows] = await connection.query(
            `
            SELECT quantity
            FROM stock_levels
            WHERE product_id = ?
            AND warehouse_id = ?
            FOR UPDATE
            `,
            [product_id, warehouse_id]
        );

        const before =
            stockRows.length
                ? Number(stockRows[0].quantity)
                : 0;

        const after = before + change;

        // Prevent negative stock
        if (after < 0) {
            await connection.rollback();

            return res.status(400).json({
                message:
                    `Adjustment would create negative stock. Current stock: ${before}`
            });
        }

        // Update existing stock
        if (stockRows.length) {

            await connection.query(
                `
                UPDATE stock_levels
                SET quantity = ?
                WHERE product_id = ?
                AND warehouse_id = ?
                `,
                [
                    after,
                    product_id,
                    warehouse_id
                ]
            );

        } else {

            // Create stock record if it doesn't exist
            await connection.query(
                `
                INSERT INTO stock_levels
                (product_id, warehouse_id, quantity)
                VALUES (?, ?, ?)
                `,
                [
                    product_id,
                    warehouse_id,
                    after
                ]
            );
        }

        // Record movement in ledger
        await connection.query(
            `
            INSERT INTO stock_ledger
            (
                product_id,
                warehouse_id,
                movement_type,
                quantity_before,
                quantity_change,
                quantity_after,
                reference_type,
                reference_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                product_id,
                warehouse_id,
                "ADJUSTMENT",
                before,
                change,
                after,
                "ADJUSTMENT",
                null
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Stock adjustment completed",
            quantity_before: before,
            quantity_change: change,
            quantity_after: after,
            reason
        });

    } catch (error) {

        await connection.rollback();

        console.error("Adjustment error:", error);

        res.status(500).json({
            message: "Failed to adjust stock"
        });

    } finally {
        connection.release();
    }
};

module.exports = {
    createAdjustment
};