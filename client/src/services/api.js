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