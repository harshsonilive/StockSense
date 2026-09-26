const pool = require("../config/db");


const getReceipts = async (req, res) => {
    try {
        const [receipts] = await pool.query(`
            SELECT
                r.id,
                r.reference_no,
                r.supplier,
                r.status,
                r.received_at,
                r.created_at,
                w.name AS warehouse
            FROM receipts r
            INNER JOIN warehouses w
                ON r.warehouse_id = w.id
            ORDER BY r.id DESC
        `);

        res.json(receipts);

    } catch (error) {
        console.error("Get receipts error:", error);

        res.status(500).json({
            message: "Failed to fetch receipts"
        });
    }
};


const createReceipt = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            reference_no,
            supplier,
            warehouse_id,
            items
        } = req.body;

        // Basic validation
        if (
            !reference_no ||
            !warehouse_id ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Reference number, warehouse and at least one item are required"
            });
        }

        for (const item of items) {
            if (
                !item.product_id ||
                !item.quantity ||
                Number(item.quantity) <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Each item must have a valid product_id and positive quantity"
                });
            }
        }

        await connection.beginTransaction();

        // Verify warehouse
        const [warehouse] = await connection.query(
            `SELECT id FROM warehouses WHERE id = ?`,
            [warehouse_id]
        );

        if (warehouse.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        // Create receipt
        const [receiptResult] = await connection.query(
            `
            INSERT INTO receipts
            (reference_no, supplier, warehouse_id)
            VALUES (?, ?, ?)
            `,
            [
                reference_no,
                supplier || null,
                warehouse_id
            ]
        );

        const receiptId = receiptResult.insertId;

        // Add receipt items
        for (const item of items) {

            const [product] = await connection.query(
                `SELECT id FROM products WHERE id = ?`,
                [item.product_id]
            );

            if (product.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    message: `Product ${item.product_id} not found`
                });
            }

            await connection.query(
                `
                INSERT INTO receipt_items
                (receipt_id, product_id, quantity)
                VALUES (?, ?, ?)
                `,
                [
                    receiptId,
                    item.product_id,
                    Number(item.quantity)
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Receipt created successfully",
            receiptId
        });

    } catch (error) {

        await connection.rollback();

        console.error("Create receipt error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Reference number already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create receipt"
        });

    } finally {
        connection.release();
    }
};


const validateReceipt = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Lock receipt while processing
        const [receipts] = await connection.query(
            `
            SELECT *
            FROM receipts
            WHERE id = ?
            FOR UPDATE
            `,
            [id]
        );

        if (receipts.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Receipt not found"
            });
        }

        const receipt = receipts[0];

        if (receipt.status !== "PENDING") {
            await connection.rollback();

            return res.status(400).json({
                message:
                    `Receipt cannot be validated because its status is ${receipt.status}`
            });
        }

        // Get receipt items
        const [items] = await connection.query(
            `
            SELECT product_id, quantity
            FROM receipt_items
            WHERE receipt_id = ?
            `,
            [id]
        );

        if (items.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Receipt contains no items"
            });
        }

        // Process every product
        for (const item of items) {

            // Lock existing stock row
            const [stockRows] = await connection.query(
                `
                SELECT quantity
                FROM stock_levels
                WHERE product_id = ?
                AND warehouse_id = ?
                FOR UPDATE
                `,
                [
                    item.product_id,
                    receipt.warehouse_id
                ]
            );

            let quantityBefore = 0;

            if (stockRows.length === 0) {

                // Create stock record
                await connection.query(
                    `
                    INSERT INTO stock_levels
                    (product_id, warehouse_id, quantity)
                    VALUES (?, ?, ?)
                    `,
                    [
                        item.product_id,
                        receipt.warehouse_id,
                        item.quantity
                    ]
                );

            } else {

                quantityBefore = Number(stockRows[0].quantity);

                await connection.query(
                    `
                    UPDATE stock_levels
                    SET quantity = quantity + ?
                    WHERE product_id = ?
                    AND warehouse_id = ?
                    `,
                    [
                        item.quantity,
                        item.product_id,
                        receipt.warehouse_id
                    ]
                );
            }

            const quantityAfter =
                quantityBefore + Number(item.quantity);

            // Ledger entry
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
                    item.product_id,
                    receipt.warehouse_id,
                    "RECEIPT",
                    quantityBefore,
                    item.quantity,
                    quantityAfter,
                    "RECEIPT",
                    id
                ]
            );
        }

        // Mark receipt as completed
        await connection.query(
            `
            UPDATE receipts
            SET
                status = 'DONE',
                received_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id]
        );

        await connection.commit();

        res.json({
            message: "Receipt validated successfully"
        });

    } catch (error) {

        await connection.rollback();

        console.error("Validate receipt error:", error);

        res.status(500).json({
            message: "Failed to validate receipt"
        });

    } finally {
        connection.release();
    }
};


module.exports = {
    getReceipts,
    createReceipt,
    validateReceipt
};