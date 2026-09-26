import { useEffect, useState } from "react";

import {
    Package,
    RefreshCw,
    Plus,
    Search,
    X,
    CheckCircle,
    AlertCircle
} from "lucide-react";

import {
    getProducts,
    createProduct
} from "../services/api";


function Products() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [error, setError] = useState("");


    const loadProducts = async (refresh = false) => {

        try {

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getProducts();

            setProducts(
                Array.isArray(data)
                    ? data
                    : data.products || []
            );

        } catch (err) {

            console.error(err);

            setError(
                "Unable to load products."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };

    const [showAddProduct, setShowAddProduct] = useState(false);

const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    unit_of_measure: "",
    reorder_point: ""
});

const [formErrors, setFormErrors] = useState({});

const [submitting, setSubmitting] = useState(false);

const [successMessage, setSuccessMessage] = useState("");

const [submitError, setSubmitError] = useState("");


const validateForm = () => {

    const errors = {};

    const name = form.name.trim();
    const sku = form.sku.trim();
    const unit = form.unit_of_measure.trim();

    if (!name) {
        errors.name = "Product name is required.";
    } else if (name.length < 2) {
        errors.name =
            "Product name must contain at least 2 characters.";
    }

    if (!sku) {
        errors.sku = "SKU is required.";
    } else if (!/^[A-Za-z0-9-]+$/.test(sku)) {
        errors.sku =
            "SKU can contain only letters, numbers and hyphens.";
    }

    if (!form.category_id) {
        errors.category_id =
            "Category ID is required.";
    } else if (
        !Number.isInteger(Number(form.category_id)) ||
        Number(form.category_id) <= 0
    ) {
        errors.category_id =
            "Category ID must be a positive number.";
    }

    if (!unit) {
        errors.unit_of_measure =
            "Unit of measure is required.";
    }

    if (
        form.reorder_point === "" ||
        Number(form.reorder_point) < 0
    ) {
        errors.reorder_point =
            "Reorder point cannot be negative.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
};

const handleCreateProduct = async (event) => {

    event.preventDefault();

    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) {
        return;
    }

    try {

        setSubmitting(true);

        const productData = {
            name: form.name.trim(),
            sku: form.sku.trim().toUpperCase(),
            category_id: Number(form.category_id),
            unit_of_measure: form.unit_of_measure.trim(),
            reorder_point: Number(form.reorder_point)
        };

        await createProduct(productData);

        setForm({
            name: "",
            sku: "",
            category_id: "",
            unit_of_measure: "",
            reorder_point: ""
        });

        setFormErrors({});

        setShowAddProduct(false);

        setSuccessMessage(
            "Product created successfully."
        );

        await loadProducts(true);

        setTimeout(() => {
            setSuccessMessage("");
        }, 3500);

    } catch (error) {

        console.error(error);

        setSubmitError(
            error.message ||
            "Unable to create product."
        );

    } finally {

        setSubmitting(false);

    }
};

const handleFieldChange = (event) => {

    const { name, value } = event.target;

    setForm((previous) => ({
        ...previous,
        [name]: value
    }));

    if (formErrors[name]) {

        setFormErrors((previous) => ({
            ...previous,
            [name]: ""
        }));
    }

    setSubmitError("");
};


    useEffect(() => {

        loadProducts();

    }, []);


    const filteredProducts = products.filter(
        (product) => {

            const searchText =
                search.toLowerCase();

            return (
                String(product.name || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(product.sku || "")
                    .toLowerCase()
                    .includes(searchText)
            );
        }
    );


    if (loading) {

        return (
            <div className="dashboard-state">
                Loading products...
            </div>
        );
    }


    if (error) {

        return (
            <div className="dashboard-state">

                <Package size={24} />

                <p>{error}</p>

                <button
                    className="secondary-button"
                    onClick={() => loadProducts()}
                >
                    Try Again
                </button>

            </div>
        );
    }


    return (
        <div className="page">
            {successMessage && (

    <div className="success-notification">

        <CheckCircle size={17} />

        <span>
            {successMessage}
        </span>

    </div>

)}


            {/* PAGE HEADER */}

            <div className="page-header">

                <div>

                    <h1>
                        Products
                    </h1>

                    <p>
                        Manage your inventory catalog
                    </p>

                </div>


                <div className="page-header-actions">

                    <button
                        className="refresh-button"
                        onClick={() => loadProducts(true)}
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
    className="primary-button"
    onClick={() => {
        setShowAddProduct(true);
        setSubmitError("");
        setFormErrors({});
    }}
>
    <Plus size={16} />

    Add Product
</button>

                </div>

            </div>


            {/* PRODUCT CARD */}

            <section className="content-card">

                <div className="content-toolbar">

                    <div className="toolbar-title">

                        <div className="toolbar-icon">
                            <Package size={17} />
                        </div>

                        <div>

                            <strong>
                                Product Catalog
                            </strong>

                            <span>
                                {products.length} products
                            </span>

                        </div>

                    </div>


                    <div className="table-search">

                        <Search size={16} />

                        <input
                            type="text"
                            placeholder="Search products or SKU..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                    </div>

                </div>


                {/* TABLE */}

                {filteredProducts.length === 0 ? (

                    <div className="empty-state">

                        <Package size={25} />

                        <strong>
                            No products found
                        </strong>

                        <span>
                            {search
                                ? "Try a different search."
                                : "Your product catalog is empty."
                            }
                        </span>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        SKU
                                    </th>

                                    <th>
                                        Unit
                                    </th>

                                    <th>
                                        Reorder Point
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredProducts.map(
                                    (product) => (

                                        <tr
                                            key={product.id}
                                        >

                                            <td>

                                                <div className="product-cell">

                                                    <div className="product-icon">
                                                        <Package
                                                            size={16}
                                                        />
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {product.name}
                                                        </strong>

                                                        <span>
                                                            ID #{product.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                <span className="sku">
                                                    {product.sku || "—"}
                                                </span>
                                            </td>


                                            <td>
                                                {product.unit_of_measure || "—"}
                                            </td>


                                            <td>
                                                {product.reorder_point ?? "—"}
                                            </td>


                                            <td>

                                                <span className="status-badge success">
                                                    Active
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>
{showAddProduct && (

    <div
        className="modal-overlay"
        onMouseDown={(event) => {

            if (
                event.target === event.currentTarget &&
                !submitting
            ) {
                setShowAddProduct(false);
            }

        }}
    >

        <div className="product-modal">

            <div className="modal-header">

                <div>

                    <h2>
                        Add New Product
                    </h2>

                    <p>
                        Add a product to your inventory catalog.
                    </p>

                </div>


                <button
                    className="modal-close"
                    onClick={() =>
                        !submitting &&
                        setShowAddProduct(false)
                    }
                    disabled={submitting}
                >
                    <X size={18} />
                </button>

            </div>


            <form
                className="product-form"
                onSubmit={handleCreateProduct}
            >

                {submitError && (

                    <div className="form-error-summary">

                        <AlertCircle size={17} />

                        <span>
                            {submitError}
                        </span>

                    </div>

                )}


                {/* PRODUCT NAME */}

                <div className="form-field">

                    <label htmlFor="name">
                        Product Name
                        <span>*</span>
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g. Steel Rods"
                        value={form.name}
                        onChange={handleFieldChange}
                        maxLength={100}
                    />

                    {formErrors.name && (
                        <small className="field-error">
                            {formErrors.name}
                        </small>
                    )}

                </div>


                {/* SKU */}

                <div className="form-field">

                    <label htmlFor="sku">
                        SKU
                        <span>*</span>
                    </label>

                    <input
                        id="sku"
                        name="sku"
                        type="text"
                        placeholder="e.g. STL-001"
                        value={form.sku}
                        onChange={handleFieldChange}
                        maxLength={50}
                    />

                    <small className="field-help">
                        Use letters, numbers and hyphens.
                    </small>

                    {formErrors.sku && (
                        <small className="field-error">
                            {formErrors.sku}
                        </small>
                    )}

                </div>


                <div className="form-row">

                    {/* CATEGORY */}

                    <div className="form-field">

                        <label htmlFor="category_id">
                            Category ID
                            <span>*</span>
                        </label>

                        <input
                            id="category_id"
                            name="category_id"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="e.g. 1"
                            value={form.category_id}
                            onChange={handleFieldChange}
                        />

                        {formErrors.category_id && (
                            <small className="field-error">
                                {formErrors.category_id}
                            </small>
                        )}

                    </div>


                    {/* UNIT */}

                    <div className="form-field">

                        <label htmlFor="unit_of_measure">
                            Unit of Measure
                            <span>*</span>
                        </label>

                        <input
                            id="unit_of_measure"
                            name="unit_of_measure"
                            type="text"
                            placeholder="e.g. kg"
                            value={form.unit_of_measure}
                            onChange={handleFieldChange}
                            maxLength={20}
                        />

                        {formErrors.unit_of_measure && (
                            <small className="field-error">
                                {formErrors.unit_of_measure}
                            </small>
                        )}

                    </div>

                </div>


                {/* REORDER POINT */}

                <div className="form-field">

                    <label htmlFor="reorder_point">
                        Reorder Point
                        <span>*</span>
                    </label>

                    <input
                        id="reorder_point"
                        name="reorder_point"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 50"
                        value={form.reorder_point}
                        onChange={handleFieldChange}
                    />

                    <small className="field-help">
                        Stock level at which replenishment
                        should be considered.
                    </small>

                    {formErrors.reorder_point && (
                        <small className="field-error">
                            {formErrors.reorder_point}
                        </small>
                    )}

                </div>


                {/* ACTIONS */}

                <div className="modal-actions">

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() =>
                            setShowAddProduct(false)
                        }
                        disabled={submitting}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={submitting}
                    >

                        {submitting ? (
                            <>
                                <RefreshCw
                                    size={15}
                                    className="spin"
                                />

                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus size={15} />

                                Create Product
                            </>
                        )}

                    </button>

                </div>

            </form>

        </div>

    </div>

)}
        </div>
    );
}


export default Products;