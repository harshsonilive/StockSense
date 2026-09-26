const pool = require("../config/db");

const getTransfers = async (req, res) => {
    try {
        const [transfers] = await pool.query(`
            SELECT
                t.id,
                t.reference_no,
                t.status,
                t.created_at,
                t.completed_at,
                wf.name AS from_warehouse,
                wt.name AS to_warehouse
            FROM transfers t
            INNER JOIN warehouses wf
                ON t.from_warehouse_id = wf.id
            INNER JOIN warehouses wt
                ON t.to_warehouse_id = wt.id
            ORDER BY t.id DESC
        `);

        res.json(transfers);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch transfers"
        });
    }
};


const createTransfer = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            reference_no,
            from_warehouse_id,
            to_warehouse_id,
            items
        } = req.body;

        if (
            !reference_no ||
            !from_warehouse_id ||
            !to_warehouse_id ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message: "Reference, source, destination and items are required"
            });
        }

        if (from_warehouse_id === to_warehouse_id) {
            return res.status(400).json({
                message: "Source and destination warehouses must be different"
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(
            `
            INSERT INTO transfers
            (reference_no, from_warehouse_id, to_warehouse_id)
            VALUES (?, ?, ?)
            `,
            [
                reference_no,
                from_warehouse_id,
                to_warehouse_id
            ]
        );

        const transferId = result.insertId;

        for (const item of items) {
            if (!item.product_id || Number(item.quantity) <= 0) {
                await connection.rollback();

                return res.status(400).json({
                    message: "Invalid transfer item"
                });
            }

            await connection.query(
                `
                INSERT INTO transfer_items
                (transfer_id, product_id, quantity)
                VALUES (?, ?, ?)
                `,
                [
                    transferId,
                    item.product_id,
                    Number(item.quantity)
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Transfer created successfully",
            transferId
        });

    } catch (error) {
        await connection.rollback();

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Reference number already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create transfer"
        });

    } finally {
        connection.release();
    }
};


const validateTransfer = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        const [transfers] = await connection.query(
            `
            SELECT *
            FROM transfers
            WHERE id = ?
            FOR UPDATE
            `,
            [id]
        );

        if (transfers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Transfer not found"
            });
        }

        const transfer = transfers[0];

        if (transfer.status !== "PENDING") {
            await connection.rollback();

            return res.status(400).json({
                message: `Transfer is already ${transfer.status}`
            });
        }

        const [items] = await connection.query(
            `
            SELECT product_id, quantity
            FROM transfer_items
            WHERE transfer_id = ?
            `,
            [id]
        );

        if (items.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Transfer contains no items"
            });
        }

        // Check source stock first
        for (const item of items) {
            const [stock] = await connection.query(
                `
                SELECT quantity
                FROM stock_levels
                WHERE product_id = ?
                AND warehouse_id = ?
                FOR UPDATE
                `,
                [
                    item.product_id,
                    transfer.from_warehouse_id
                ]
            );

            const available =
                stock.length ? Number(stock[0].quantity) : 0;

            if (available < Number(item.quantity)) {
                await connection.rollback();

                return res.status(400).json({
                    message:
                        `Insufficient stock for product ${item.product_id}. Available: ${available}, requested: ${item.quantity}`
                });
            }
        }

        // Perform movement
        for (const item of items) {

            const [sourceStock] = await connection.query(
                `
                SELECT quantity
                FROM stock_levels
                WHERE product_id = ?
                AND warehouse_id = ?
                FOR UPDATE
                `,
                [
                    item.product_id,
                    transfer.from_warehouse_id
                ]
            );

            const sourceBefore =
                Number(sourceStock[0].quantity);

            const sourceAfter =
                sourceBefore - Number(item.quantity);

            await connection.query(
                `
                UPDATE stock_levels
                SET quantity = ?
                WHERE product_id = ?
                AND warehouse_id = ?
                `,
                [
                    sourceAfter,
                    item.product_id,
                    transfer.from_warehouse_id
                ]
            );

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
                    transfer.from_warehouse_id,
                    "TRANSFER_OUT",
                    sourceBefore,
                    -Number(item.quantity),
                    sourceAfter,
                    "TRANSFER",
                    id
                ]
            );


            // Destination stock
            const [destinationStock] = await connection.query(
                `
                SELECT quantity
                FROM stock_levels
                WHERE product_id = ?
                AND warehouse_id = ?
                FOR UPDATE
                `,
                [
                    item.product_id,
                    transfer.to_warehouse_id
                ]
            );

            const destinationBefore =
                destinationStock.length
                    ? Number(destinationStock[0].quantity)
                    : 0;

            const destinationAfter =
                destinationBefore + Number(item.quantity);

            if (destinationStock.length) {
                await connection.query(
                    `
                    UPDATE stock_levels
                    SET quantity = ?
                    WHERE product_id = ?
                    AND warehouse_id = ?
                    `,
                    [
                        destinationAfter,
                        item.product_id,
                        transfer.to_warehouse_id
                    ]
                );
            } else {
                await connection.query(
                    `
                    INSERT INTO stock_levels
                    (product_id, warehouse_id, quantity)
                    VALUES (?, ?, ?)
                    `,
                    [
                        item.product_id,
                        transfer.to_warehouse_id,
                        item.quantity
                    ]
                );
            }

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
                    transfer.to_warehouse_id,
                    "TRANSFER_IN",
                    destinationBefore,
                    Number(item.quantity),
                    destinationAfter,
                    "TRANSFER",
                    id
                ]
            );
        }

        await connection.query(
            `
            UPDATE transfers
            SET
                status = 'DONE',
                completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id]
        );

        await connection.commit();

        res.json({
            message: "Transfer completed successfully"
        });

    } catch (error) {
        await connection.rollback();

        console.error(error);

        res.status(500).json({
            message: "Failed to complete transfer"
        });

    } finally {
        connection.release();
    }
};


module.exports = {
    getTransfers,
    createTransfer,
    validateTransfer
};