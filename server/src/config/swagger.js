const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "StockSense API",
            version: "1.0.0",
            description: "Inventory Management API for StockSense"
        },

        servers: [
            {
                url: "http://localhost:5000"
            }
        ]
    },

    apis: [
        "./src/routes/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;