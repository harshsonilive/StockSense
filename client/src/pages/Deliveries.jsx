import { useEffect, useState } from "react";

import {
    Truck,
    RefreshCw,
    Plus,
    Search,
    X,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

import {
    getDeliveries,
    createDelivery,
    getProducts,
    getWarehouses
} from "../services/api";


function Deliveries() {

    const [deliveries, setDeliveries] = useState([]);

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
        customer: "",
        warehouse_id: "",
        product_id: "",
        quantity: ""
    });


    const loadDeliveries = async (refresh = false) => {

        try {

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getDeliveries();

            setDeliveries(
                Array.isArray(data)
                    ? data
                    : data.deliveries || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load deliveries."
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

        loadDeliveries();
        loadFormData();

    }, []);


    const filteredDeliveries =
        deliveries.filter((delivery) => {

            const text =
                search.toLowerCase();

            return (
                String(
                    delivery.reference_no || ""
                )
                    .toLowerCase()
                    .includes(text) ||

                String(
                    delivery.customer || ""
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

        if (!form.customer.trim()) {
            errors.customer =
                "Customer is required.";
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
            customer: "",
            warehouse_id: "",
            product_id: "",
            quantity: ""
        });

        setFormErrors({});
        setSubmitError("");

    };


    const handleCreateDelivery = async (event) => {

        event.preventDefault();

        setSuccessMessage("");
        setSubmitError("");

        if (!validateForm()) {
            return;
        }

        try {

            setSubmitting(true);

            const deliveryData = {
                reference_no:
                    form.reference_no.trim(),

                customer:
                    form.customer.trim(),

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

            await createDelivery(deliveryData);

            resetForm();

            setShowModal(false);

            setSuccessMessage(
                "Delivery created successfully."
            );

            await loadDeliveries(true);

            setTimeout(() => {
                setSuccessMessage("");
            }, 3500);

        } catch (err) {

            console.error(err);

            setSubmitError(
                err.message ||
                "Unable to create delivery."
            );

        } finally {

            setSubmitting(false);

        }
    };


    if (loading) {

        return (
            <div className="dashboard-state">
                <Truck size={24} />
                <p>Loading deliveries...</p>
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
                    onClick={() => loadDeliveries()}
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


            <div className="page-header">

                <div>

                    <h1>
                        Deliveries
                    </h1>

                    <p>
                        Manage outgoing stock deliveries
                    </p>

                </div>


                <div className="page-header-actions">

                    <button
                        className="refresh-button"
                        onClick={() =>
                            loadDeliveries(true)
                        }
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
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >

                        <Plus size={16} />

                        New Delivery

                    </button>

                </div>

            </div>


            <section className="content-card">

                <div className="content-toolbar">

                    <div className="toolbar-title">

                        <div className="toolbar-icon">
                            <Truck size={17} />
                        </div>

                        <div>

                            <strong>
                                Delivery History
                            </strong>

                            <span>
                                {deliveries.length} deliveries
                            </span>

                        </div>

                    </div>


                    <div className="table-search">

                        <Search size={15} />

                        <input
                            type="text"
                            placeholder="Search reference or customer..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {filteredDeliveries.length === 0 ? (

                    <div className="empty-state">

                        <Truck size={26} />

                        <strong>
                            No deliveries found
                        </strong>

                        <span>
                            Create your first delivery.
                        </span>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>Reference</th>
                                    <th>Customer</th>
                                    <th>Warehouse</th>
                                    <th>Status</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredDeliveries.map(
                                    (delivery, index) => (

                                        <tr
                                            key={
                                                delivery.id ||
                                                delivery.reference_no ||
                                                index
                                            }
                                        >

                                            <td>
                                                <span className="sku">
                                                    {
                                                        delivery.reference_no ||
                                                        `Delivery #${delivery.id}`
                                                    }
                                                </span>
                                            </td>


                                            <td>
                                                <strong>
                                                    {
                                                        delivery.customer ||
                                                        "—"
                                                    }
                                                </strong>
                                            </td>


                                            <td>
                                                {
                                                    delivery.warehouse ||
                                                    delivery.warehouse_name ||
                                                    delivery.warehouse_id ||
                                                    "—"
                                                }
                                            </td>


                                            <td>

                                                <span className="status-badge success">

                                                    <CheckCircle2
                                                        size={12}
                                                    />

                                                    {
                                                        delivery.status ||
                                                        "Pending"
                                                    }

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
                                    New Stock Delivery
                                </h2>

                                <p>
                                    Record outgoing inventory.
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
                                handleCreateDelivery
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


                            <div className="form-field">

                                <label htmlFor="reference_no">
                                    Reference No.
                                    <span>*</span>
                                </label>

                                <input
                                    id="reference_no"
                                    name="reference_no"
                                    type="text"
                                    placeholder="e.g. DEL-001"
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


                            <div className="form-field">

                                <label htmlFor="customer">
                                    Customer
                                    <span>*</span>
                                </label>

                                <input
                                    id="customer"
                                    name="customer"
                                    type="text"
                                    placeholder="e.g. XYZ Manufacturing"
                                    value={
                                        form.customer
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    maxLength={100}
                                />

                                {formErrors.customer && (

                                    <small className="field-error">
                                        {
                                            formErrors.customer
                                        }
                                    </small>

                                )}

                            </div>


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
                                    placeholder="e.g. 20"
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
                                            <Truck
                                                size={15}
                                            />

                                            Create Delivery

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


export default Deliveries;