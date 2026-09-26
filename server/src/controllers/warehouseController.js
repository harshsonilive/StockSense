const pool = require("../config/db");

const getWarehouses = async (req, res) => {
    try {
        const [warehouses] = await pool.query(`
            SELECT
                w.id,
                w.name,
                w.type,
                w.parent_location_id,
                p.name AS parent_location
            FROM warehouses w
            LEFT JOIN warehouses p
                ON w.parent_location_id = p.id
            ORDER BY w.id ASC
        `);

        res.json(warehouses);

    } catch (error) {
        console.error("Get warehouses error:", error);

        res.status(500).json({
            message: "Failed to fetch warehouses"
        });
    }
};


const createWarehouse = async (req, res) => {
    try {
        const {
            name,
            type,
            parent_location_id
        } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                message: "Name and type are required"
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO warehouses
            (name, type, parent_location_id)
            VALUES (?, ?, ?)
            `,
            [
                name,
                type,
                parent_location_id || null
            ]
        );

        res.status(201).json({
            message: "Warehouse created successfully",
            warehouseId: result.insertId
        });

    } catch (error) {
        console.error("Create warehouse error:", error);

        res.status(500).json({
            message: "Failed to create warehouse"
        });
    }
};


module.exports = {
    getWarehouses,
    createWarehouse
};