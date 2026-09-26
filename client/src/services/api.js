const API_BASE_URL = "http://localhost:5000/api";

export const getDashboardSummary = async () => {
    const response = await fetch(
        `${API_BASE_URL}/dashboard/summary`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard summary");
    }

    return response.json();
};


export const getRecentMovements = async () => {
    const response = await fetch(
        `${API_BASE_URL}/dashboard/recent-movements`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch recent movements");
    }

    return response.json();
};


export const getProducts = async () => {
    const response = await fetch(
        `${API_BASE_URL}/products`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
};

export const createProduct = async (productData) => {
    const response = await fetch(
        `${API_BASE_URL}/products`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to create product"
        );
    }

    return data;
};

export const getStock = async () => {
    const response = await fetch(
        `${API_BASE_URL}/stock`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to fetch inventory"
        );
    }

    return data;
};

export const getReceipts = async () => {
    const response = await fetch(
        `${API_BASE_URL}/receipts`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to fetch receipts"
        );
    }

    return data;
};


export const createReceipt = async (receiptData) => {
    const response = await fetch(
        `${API_BASE_URL}/receipts`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(receiptData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to create receipt"
        );
    }

    return data;
};


export const getWarehouses = async () => {
    const response = await fetch(
        `${API_BASE_URL}/warehouses`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to fetch warehouses"
        );
    }

    return data;
};


export const getDeliveries = async () => {
    const response = await fetch(
        `${API_BASE_URL}/deliveries`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to fetch deliveries"
        );
    }

    return data;
};


export const createDelivery = async (deliveryData) => {
    const response = await fetch(
        `${API_BASE_URL}/deliveries`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(deliveryData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to create delivery"
        );
    }

    return data;
};


export const getTransfers = async () => {
    const response = await fetch(
        `${API_BASE_URL}/transfers`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to fetch transfers"
        );
    }

    return data;
};


export const createTransfer = async (transferData) => {
    const response = await fetch(
        `${API_BASE_URL}/transfers`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transferData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to create transfer"
        );
    }

    return data;
};


export const validateTransfer = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/transfers/${id}/validate`,
        {
            method: "POST"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Failed to validate transfer"
        );
    }

    return data;
};