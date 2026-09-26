const pool = require("../config/db");


const getDeliveries = async (req, res) => {
    try {
        const [deliveries] = await pool.query(`
            SELECT
                d.id,
                d.reference_no,
                d.customer,
                d.status,
                d.delivered_at,
                d.created_at,
                w.name AS warehouse
            FROM deliveries d
            INNER JOIN warehouses w
                ON d.warehouse_id = w.id
            ORDER BY d.id DESC
        `);

        res.json(deliveries);

    } catch (error) {
        console.error("Get deliveries error:", error);

        res.status(500).json({
            message: "Failed to fetch deliveries"
        });
    }
};


const createDelivery = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            reference_no,
            customer,
            warehouse_id,
            items
        } = req.body;

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

        const [deliveryResult] = await connection.query(
            `
            INSERT INTO deliveries
            (reference_no, customer, warehouse_id)
            VALUES (?, ?, ?)
            `,
            [
                reference_no,
                customer || null,
                warehouse_id
            ]
        );

        const deliveryId = deliveryResult.insertId;

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
                INSERT INTO delivery_items
                (delivery_id, product_id, quantity)
                VALUES (?, ?, ?)
                `,
                [
                    deliveryId,
                    item.product_id,
                    Number(item.quantity)
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Delivery created successfully",
            deliveryId
        });

    } catch (error) {

        await connection.rollback();

        console.error("Create delivery error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Reference number already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create delivery"
        });

    } finally {
        connection.release();
    }
};


const validateDelivery = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        const [deliveries] = await connection.query(
            `
            SELECT *
            FROM deliveries
            WHERE id = ?
            FOR UPDATE
            `,
            [id]
        );

        if (deliveries.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Delivery not found"
            });
        }

        const delivery = deliveries[0];

        if (delivery.status !== "PENDING") {
            await connection.rollback();

            return res.status(400).json({
                message:
                    `Delivery cannot be validated because its status is ${delivery.status}`
            });
        }

        const [items] = await connection.query(
            `
            SELECT product_id, quantity
            FROM delivery_items
            WHERE delivery_id = ?
            `,
            [id]
        );

        if (items.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Delivery contains no items"
            });
        }

        // First check ALL stock before modifying anything
        for (const item of items) {

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
                    delivery.warehouse_id
                ]
            );

            if (stockRows.length === 0) {
                await connection.rollback();

                return res.status(400).json({
                    message:
                        `No stock exists for product ${item.product_id} at this warehouse`
                });
            }

            const available =
                Number(stockRows[0].quantity);

            if (available < Number(item.quantity)) {
                await connection.rollback();

                return res.status(400).json({
                    message:
                        `Insufficient stock for product ${item.product_id}. Available: ${available}, requested: ${item.quantity}`
                });
            }
        }

        // Now perform the stock deductions
        for (const item of items) {

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
                    delivery.warehouse_id
                ]
            );

            const quantityBefore =
                Number(stockRows[0].quantity);

            const quantityAfter =
                quantityBefore - Number(item.quantity);

            await connection.query(
                `
                UPDATE stock_levels
                SET quantity = ?
                WHERE product_id = ?
                AND warehouse_id = ?
                `,
                [
                    quantityAfter,
                    item.product_id,
                    delivery.warehouse_id
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
                    delivery.warehouse_id,
                    "DELIVERY",
                    quantityBefore,
                    -Number(item.quantity),
                    quantityAfter,
                    "DELIVERY",
                    id
                ]
            );
        }

        await connection.query(
            `
            UPDATE deliveries
            SET
                status = 'DONE',
                delivered_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id]
        );

        await connection.commit();

        res.json({
            message: "Delivery validated successfully"
        });

    } catch (error) {

        await connection.rollback();

        console.error("Validate delivery error:", error);

        res.status(500).json({
            message: "Failed to validate delivery"
        });

    } finally {
        connection.release();
    }
};


module.exports = {
    getDeliveries,
    createDelivery,
    validateDelivery
};