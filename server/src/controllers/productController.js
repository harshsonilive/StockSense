const pool = require("../config/db");

const getProducts = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT
                p.id,
                p.name,
                p.sku,
                p.unit_of_measure,
                p.reorder_point,
                c.name AS category
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.id DESC
        `);

        res.json(products);
    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
};


const createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category_id,
            unit_of_measure,
            reorder_point
        } = req.body;

        if (!name || !sku || !unit_of_measure) {
            return res.status(400).json({
                message: "Name, SKU and unit of measure are required"
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO products
            (name, sku, category_id, unit_of_measure, reorder_point)
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                name,
                sku,
                category_id || null,
                unit_of_measure,
                reorder_point || 0
            ]
        );

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Create product error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "SKU already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create product"
        });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            sku,
            category_id,
            unit_of_measure,
            reorder_point
        } = req.body;

        if (!name || !sku || !unit_of_measure) {
            return res.status(400).json({
                message: "Name, SKU and unit of measure are required"
            });
        }

        const [result] = await pool.query(
            `
            UPDATE products
            SET
                name = ?,
                sku = ?,
                category_id = ?,
                unit_of_measure = ?,
                reorder_point = ?
            WHERE id = ?
            `,
            [
                name,
                sku,
                category_id || null,
                unit_of_measure,
                reorder_point || 0,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Update product error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "SKU already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update product"
        });
    }
};


module.exports = {
    getProducts,
    createProduct,
    updateProduct
};