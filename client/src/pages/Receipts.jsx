import { useEffect, useState } from "react";

import {
    ClipboardPlus,
    RefreshCw,
    Plus,
    Search,
    X,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

import {
    getReceipts,
    createReceipt,
    getProducts,
    getWarehouses
} from "../services/api";


function Receipts() {

    const [receipts, setReceipts] = useState([]);

    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formErrors, setFormErrors] = useState({});

    const [form, setForm] = useState({
        reference_no: "",
        supplier: "",
        warehouse_id: "",
        product_id: "",
        quantity: ""
    });


    const loadReceipts = async (refresh = false) => {

        try {

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getReceipts();

            setReceipts(
                Array.isArray(data)
                    ? data
                    : data.receipts || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load receipts."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    const loadFormData = async () => {

        try {

            const [
                productData,
                warehouseData
            ] = await Promise.all([
                getProducts(),
                getWarehouses()
            ]);

            setProducts(
                Array.isArray(productData)
                    ? productData
                    : productData.products || []
            );

            setWarehouses(
                Array.isArray(warehouseData)
                    ? warehouseData
                    : warehouseData.warehouses || []
            );

        } catch (err) {

            console.error(err);

            setSubmitError(
                "Unable to load products or warehouses."
            );

        }
    };


    useEffect(() => {

        loadReceipts();

        loadFormData();

    }, []);


    const filteredReceipts =
        receipts.filter((receipt) => {

            const text =
                search.toLowerCase();

            return (
                String(
                    receipt.reference_no || ""
                )
                    .toLowerCase()
                    .includes(text) ||

                String(
                    receipt.supplier || ""
                )
                    .toLowerCase()
                    .includes(text)
            );

        });


    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));

        setFormErrors(previous => ({
            ...previous,
            [name]: ""
        }));

        setSubmitError("");

    };


    const validateForm = () => {

        const errors = {};

        if (!form.reference_no.trim()) {
            errors.reference_no =
                "Reference number is required.";
        }

        if (!form.supplier.trim()) {
            errors.supplier =
                "Supplier is required.";
        }

        if (!form.warehouse_id) {
            errors.warehouse_id =
                "Select a warehouse.";
        }

        if (!form.product_id) {
            errors.product_id =
                "Select a product.";
        }

        if (
            form.quantity === "" ||
            Number(form.quantity) <= 0
        ) {
            errors.quantity =
                "Quantity must be greater than 0.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };


    const resetForm = () => {

        setForm({
            reference_no: "",
            supplier: "",
            warehouse_id: "",
            product_id: "",
            quantity: ""
        });

        setFormErrors({});
        setSubmitError("");

    };


    const handleCreateReceipt = async (event) => {

        event.preventDefault();

        setSuccessMessage("");
        setSubmitError("");

        if (!validateForm()) {
            return;
        }

        try {

            setSubmitting(true);

            const receiptData = {
                reference_no:
                    form.reference_no.trim(),

                supplier:
                    form.supplier.trim(),

                warehouse_id:
                    Number(form.warehouse_id),

                items: [
                    {
                        product_id:
                            Number(form.product_id),

                        quantity:
                            Number(form.quantity)
                    }
                ]
            };

            await createReceipt(receiptData);

            resetForm();

            setShowModal(false);

            setSuccessMessage(
                "Receipt created successfully."
            );

            await loadReceipts(true);

            setTimeout(() => {
                setSuccessMessage("");
            }, 3500);

        } catch (err) {

            console.error(err);

            setSubmitError(
                err.message ||
                "Unable to create receipt."
            );

        } finally {

            setSubmitting(false);

        }
    };


    const openModal = () => {

        resetForm();

        setShowModal(true);

    };


    if (loading) {

        return (
            <div className="dashboard-state">
                <ClipboardPlus size={24} />
                <p>Loading receipts...</p>
            </div>
        );

    }


    if (error) {

        return (
            <div className="dashboard-state">

                <AlertCircle size={24} />

                <p>{error}</p>

                <button
                    className="secondary-button"
                    onClick={() => loadReceipts()}
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

                    <CheckCircle2 size={17} />

                    {successMessage}

                </div>

            )}


            {/* HEADER */}

            <div className="page-header">

                <div>

                    <h1>
                        Receipts
                    </h1>

                    <p>
                        Record incoming stock into your warehouses
                    </p>

                </div>


                <div className="page-header-actions">

                    <button
                        className="refresh-button"
                        onClick={() => loadReceipts(true)}
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={15}
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
                        onClick={openModal}
                    >

                        <Plus size={16} />

                        New Receipt

                    </button>

                </div>

            </div>


            {/* RECEIPTS TABLE */}

            <section className="content-card">

                <div className="content-toolbar">

                    <div className="toolbar-title">

                        <div className="toolbar-icon">
                            <ClipboardPlus size={17} />
                        </div>

                        <div>

                            <strong>
                                Receipt History
                            </strong>

                            <span>
                                {receipts.length} receipts
                            </span>

                        </div>

                    </div>


                    <div className="table-search">

                        <Search size={15} />

                        <input
                            type="text"
                            placeholder="Search reference or supplier..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                    </div>

                </div>


                {filteredReceipts.length === 0 ? (

                    <div className="empty-state">

                        <ClipboardPlus size={26} />

                        <strong>
                            No receipts found
                        </strong>

                        <span>
                            Create your first stock receipt.
                        </span>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Reference
                                    </th>

                                    <th>
                                        Supplier
                                    </th>

                                    <th>
                                        Warehouse
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredReceipts.map(
                                    (receipt, index) => (

                                        <tr
                                            key={
                                                receipt.id ||
                                                receipt.reference_no ||
                                                index
                                            }
                                        >

                                            <td>

                                                <span className="sku">
                                                    {receipt.reference_no ||
                                                        `Receipt #${receipt.id}`}
                                                </span>

                                            </td>


                                            <td>

                                                <strong>
                                                    {receipt.supplier ||
                                                        "—"}
                                                </strong>

                                            </td>


                                            <td>
                                                {receipt.warehouse ||
                                                    receipt.warehouse_name ||
                                                    receipt.warehouse_id ||
                                                    "—"}
                                            </td>


                                            <td>

                                                <span className="status-badge success">

                                                    <CheckCircle2
                                                        size={12}
                                                    />

                                                    {receipt.status ||
                                                        "Received"}

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


            {/* CREATE RECEIPT MODAL */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                                event.currentTarget &&
                            !submitting
                        ) {
                            setShowModal(false);
                        }

                    }}
                >

                    <div className="product-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    New Stock Receipt
                                </h2>

                                <p>
                                    Record incoming inventory.
                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    !submitting &&
                                    setShowModal(false)
                                }
                                disabled={submitting}
                            >

                                <X size={18} />

                            </button>

                        </div>


                        <form
                            className="product-form"
                            onSubmit={
                                handleCreateReceipt
                            }
                        >

                            {submitError && (

                                <div className="form-error-summary">

                                    <AlertCircle
                                        size={17}
                                    />

                                    <span>
                                        {submitError}
                                    </span>

                                </div>

                            )}


                            {/* REFERENCE */}

                            <div className="form-field">

                                <label htmlFor="reference_no">
                                    Reference No.
                                    <span>*</span>
                                </label>

                                <input
                                    id="reference_no"
                                    name="reference_no"
                                    type="text"
                                    placeholder="e.g. REC-002"
                                    value={
                                        form.reference_no
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    maxLength={50}
                                />

                                {formErrors.reference_no && (

                                    <small className="field-error">
                                        {
                                            formErrors.reference_no
                                        }
                                    </small>

                                )}

                            </div>


                            {/* SUPPLIER */}

                            <div className="form-field">

                                <label htmlFor="supplier">
                                    Supplier
                                    <span>*</span>
                                </label>

                                <input
                                    id="supplier"
                                    name="supplier"
                                    type="text"
                                    placeholder="e.g. ABC Metals"
                                    value={
                                        form.supplier
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    maxLength={100}
                                />

                                {formErrors.supplier && (

                                    <small className="field-error">
                                        {
                                            formErrors.supplier
                                        }
                                    </small>

                                )}

                            </div>


                            {/* WAREHOUSE */}

                            <div className="form-field">

                                <label htmlFor="warehouse_id">
                                    Warehouse
                                    <span>*</span>
                                </label>

                                <select
                                    id="warehouse_id"
                                    name="warehouse_id"
                                    value={
                                        form.warehouse_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Select warehouse
                                    </option>

                                    {warehouses.map(
                                        warehouse => (

                                            <option
                                                key={
                                                    warehouse.id
                                                }
                                                value={
                                                    warehouse.id
                                                }
                                            >
                                                {
                                                    warehouse.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                                {formErrors.warehouse_id && (

                                    <small className="field-error">
                                        {
                                            formErrors.warehouse_id
                                        }
                                    </small>

                                )}

                            </div>


                            {/* PRODUCT */}

                            <div className="form-field">

                                <label htmlFor="product_id">
                                    Product
                                    <span>*</span>
                                </label>

                                <select
                                    id="product_id"
                                    name="product_id"
                                    value={
                                        form.product_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Select product
                                    </option>

                                    {products.map(
                                        product => (

                                            <option
                                                key={
                                                    product.id
                                                }
                                                value={
                                                    product.id
                                                }
                                            >
                                                {product.name}
                                                {product.sku
                                                    ? ` (${product.sku})`
                                                    : ""}
                                            </option>

                                        )
                                    )}

                                </select>

                                {formErrors.product_id && (

                                    <small className="field-error">
                                        {
                                            formErrors.product_id
                                        }
                                    </small>

                                )}

                            </div>


                            {/* QUANTITY */}

                            <div className="form-field">

                                <label htmlFor="quantity">
                                    Quantity
                                    <span>*</span>
                                </label>

                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="e.g. 50"
                                    value={
                                        form.quantity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                {formErrors.quantity && (

                                    <small className="field-error">
                                        {
                                            formErrors.quantity
                                        }
                                    </small>

                                )}

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        submitting
                                    }
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
                                            <ClipboardPlus
                                                size={15}
                                            />

                                            Create Receipt

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


export default Receipts;