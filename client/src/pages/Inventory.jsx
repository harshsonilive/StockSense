import { useEffect, useMemo, useState } from "react";

import {
    Package,
    RefreshCw,
    Search,
    Warehouse,
    AlertTriangle,
    CheckCircle2,
    XCircle
} from "lucide-react";

import { getStock } from "../services/api";


function Inventory() {

    const [stock, setStock] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [warehouseFilter, setWarehouseFilter] =
        useState("ALL");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [error, setError] = useState("");


    const loadStock = async (refresh = false) => {

        try {

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getStock();

            setStock(
                Array.isArray(data)
                    ? data
                    : data.stock || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load inventory."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    useEffect(() => {

        loadStock();

    }, []);


    /*
     * Get unique warehouses from
     * the live backend data.
     */
    const warehouses = useMemo(() => {

        return [
            ...new Set(
                stock
                    .map(item => item.warehouse)
                    .filter(Boolean)
            )
        ];

    }, [stock]);


    /*
     * Filter inventory.
     */
    const filteredStock = useMemo(() => {

        const searchText =
            search.trim().toLowerCase();

        return stock.filter((item) => {

            const matchesSearch =
                !searchText ||
                String(item.product || "")
                    .toLowerCase()
                    .includes(searchText) ||
                String(item.sku || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesWarehouse =
                warehouseFilter === "ALL" ||
                item.warehouse === warehouseFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                item.stock_status === statusFilter;

            return (
                matchesSearch &&
                matchesWarehouse &&
                matchesStatus
            );
        });

    }, [
        stock,
        search,
        warehouseFilter,
        statusFilter
    ]);


    /*
     * Summary statistics.
     */
    const totalItems = stock.length;

    const totalQuantity = stock.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    const lowStockCount = stock.filter(
        item =>
            item.stock_status === "LOW_STOCK"
    ).length;

    const outOfStockCount = stock.filter(
        item =>
            item.stock_status === "OUT_OF_STOCK"
    ).length;


    const getStatusInfo = (status) => {

        switch (status) {

            case "LOW_STOCK":
                return {
                    label: "Low Stock",
                    className: "warning",
                    icon: AlertTriangle
                };

            case "OUT_OF_STOCK":
                return {
                    label: "Out of Stock",
                    className: "danger",
                    icon: XCircle
                };

            case "IN_STOCK":
            default:
                return {
                    label: "In Stock",
                    className: "success",
                    icon: CheckCircle2
                };
        }
    };


    if (loading) {

        return (
            <div className="dashboard-state">
                <Package size={24} />
                <p>Loading inventory...</p>
            </div>
        );
    }


    if (error) {

        return (
            <div className="dashboard-state">

                <AlertTriangle size={24} />

                <p>{error}</p>

                <button
                    className="secondary-button"
                    onClick={() => loadStock()}
                >
                    Try Again
                </button>

            </div>
        );
    }


    return (
        <div className="page">

            {/* HEADER */}

            <div className="page-header">

                <div>

                    <h1>
                        Inventory
                    </h1>

                    <p>
                        Monitor stock levels across your warehouses
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={() => loadStock(true)}
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

            </div>


            {/* SUMMARY */}

            <div className="inventory-summary">

                <div className="inventory-summary-card">

                    <div className="inventory-summary-icon">
                        <Package size={17} />
                    </div>

                    <div>

                        <span>
                            Stock Items
                        </span>

                        <strong>
                            {totalItems}
                        </strong>

                    </div>

                </div>


                <div className="inventory-summary-card">

                    <div className="inventory-summary-icon">
                        <Warehouse size={17} />
                    </div>

                    <div>

                        <span>
                            Total Quantity
                        </span>

                        <strong>
                            {totalQuantity.toLocaleString()}
                        </strong>

                    </div>

                </div>


                <div className="inventory-summary-card">

                    <div className="inventory-summary-icon warning-icon">
                        <AlertTriangle size={17} />
                    </div>

                    <div>

                        <span>
                            Low Stock
                        </span>

                        <strong>
                            {lowStockCount}
                        </strong>

                    </div>

                </div>


                <div className="inventory-summary-card">

                    <div className="inventory-summary-icon danger-icon">
                        <XCircle size={17} />
                    </div>

                    <div>

                        <span>
                            Out of Stock
                        </span>

                        <strong>
                            {outOfStockCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* MAIN CARD */}

            <section className="content-card">

                <div className="content-toolbar">

                    <div className="toolbar-title">

                        <div className="toolbar-icon">
                            <Package size={17} />
                        </div>

                        <div>

                            <strong>
                                Current Stock
                            </strong>

                            <span>
                                {filteredStock.length} of {stock.length} records
                            </span>

                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="inventory-controls">

                        <div className="table-search">

                            <Search size={15} />

                            <input
                                type="text"
                                placeholder="Search product or SKU..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />

                        </div>


                        {/* WAREHOUSE */}

                        <select
                            className="filter-select"
                            value={warehouseFilter}
                            onChange={(event) =>
                                setWarehouseFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Warehouses
                            </option>

                            {warehouses.map(
                                warehouse => (

                                    <option
                                        key={warehouse}
                                        value={warehouse}
                                    >
                                        {warehouse}
                                    </option>

                                )
                            )}

                        </select>


                        {/* STATUS */}

                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="IN_STOCK">
                                In Stock
                            </option>

                            <option value="LOW_STOCK">
                                Low Stock
                            </option>

                            <option value="OUT_OF_STOCK">
                                Out of Stock
                            </option>

                        </select>

                    </div>

                </div>


                {/* TABLE */}

                {filteredStock.length === 0 ? (

                    <div className="empty-state">

                        <Package size={26} />

                        <strong>
                            No inventory found
                        </strong>

                        <span>
                            Try changing your search
                            or filters.
                        </span>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table inventory-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        SKU
                                    </th>

                                    <th>
                                        Warehouse
                                    </th>

                                    <th>
                                        Quantity
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

                                {filteredStock.map(
                                    (item) => {

                                        const status =
                                            getStatusInfo(
                                                item.stock_status
                                            );

                                        const StatusIcon =
                                            status.icon;

                                        return (

                                            <tr
                                                key={item.id}
                                            >

                                                {/* PRODUCT */}

                                                <td>

                                                    <div className="product-cell">

                                                        <div className="product-icon">
                                                            <Package
                                                                size={16}
                                                            />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {item.product}
                                                            </strong>

                                                            <span>
                                                                Product ID #{item.product_id}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* SKU */}

                                                <td>

                                                    <span className="sku">
                                                        {item.sku || "—"}
                                                    </span>

                                                </td>


                                                {/* WAREHOUSE */}

                                                <td>

                                                    <div className="warehouse-cell">

                                                        <Warehouse
                                                            size={14}
                                                        />

                                                        {item.warehouse}

                                                    </div>

                                                </td>


                                                {/* QUANTITY */}

                                                <td>

                                                    <strong className="quantity-value">

                                                        {Number(
                                                            item.quantity || 0
                                                        ).toLocaleString()}

                                                    </strong>

                                                    <span className="quantity-unit">
                                                        {item.unit_of_measure}
                                                    </span>

                                                </td>


                                                {/* REORDER */}

                                                <td>

                                                    {Number(
                                                        item.reorder_point || 0
                                                    ).toLocaleString()}

                                                    <span className="quantity-unit">
                                                        {item.unit_of_measure}
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`status-badge ${status.className}`}
                                                    >

                                                        <StatusIcon
                                                            size={12}
                                                        />

                                                        {status.label}

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}


export default Inventory;