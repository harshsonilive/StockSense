import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    PackagePlus,
    Truck,
    ArrowLeftRight,
    Plus,
    RefreshCw,
    AlertTriangle,
    Warehouse,
    Package,
    Boxes,
    ClipboardList
} from "lucide-react";

import {
    getDashboardSummary,
    getRecentMovements
} from "../services/api";


function Dashboard() {

    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [movements, setMovements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");


    const loadDashboard = async (showRefresh = false) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [
                summaryData,
                movementsData
            ] = await Promise.all([
                getDashboardSummary(),
                getRecentMovements()
            ]);

            setSummary(summaryData);
            setMovements(movementsData);

        } catch (err) {

            console.error(err);

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    useEffect(() => {
        loadDashboard();
    }, []);


    if (loading) {

        return (
            <div className="dashboard-state">
                Loading dashboard...
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
                    onClick={() => loadDashboard()}
                >
                    Try Again
                </button>

            </div>
        );

    }


    const movementTypeLabel = (type) => {

        const labels = {
            RECEIPT: "Receipt",
            DELIVERY: "Delivery",
            TRANSFER_IN: "Transfer In",
            TRANSFER_OUT: "Transfer Out",
            ADJUSTMENT: "Adjustment"
        };

        return labels[type] || type;

    };


    const movementClass = (quantity) => {

        if (quantity > 0) {
            return "movement-positive";
        }

        if (quantity < 0) {
            return "movement-negative";
        }

        return "";

    };


    return (

        <div className="dashboard">

            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <div className="dashboard-header">

                <div>

                    <div className="page-title-row">

                        <div>

                            <h1>
                                Dashboard
                            </h1>

                            <p>
                                Real-time overview of your
                                inventory operations
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    className="refresh-button"
                    onClick={() => loadDashboard(true)}
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

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </div>


            {/* =========================================
                QUICK ACTIONS
            ========================================= */}

            <div className="quick-actions">

                <button
                    className="quick-action primary"
                    onClick={() => navigate("/products")}
                >

                    <span className="quick-action-icon">
                        <Plus size={17} />
                    </span>

                    <span>
                        Add Product
                    </span>

                </button>


                <button
                    className="quick-action"
                    onClick={() => navigate("/receipts")}
                >

                    <span className="quick-action-icon">
                        <PackagePlus size={17} />
                    </span>

                    <span>
                        Receive Stock
                    </span>

                </button>


                <button
                    className="quick-action"
                    onClick={() => navigate("/deliveries")}
                >

                    <span className="quick-action-icon">
                        <Truck size={17} />
                    </span>

                    <span>
                        Create Delivery
                    </span>

                </button>


                <button
                    className="quick-action"
                    onClick={() => navigate("/transfers")}
                >

                    <span className="quick-action-icon">
                        <ArrowLeftRight size={17} />
                    </span>

                    <span>
                        Transfer Stock
                    </span>

                </button>

            </div>


            {/* =========================================
                KPI CARDS
            ========================================= */}

            <div className="stats-grid">


                {/* TOTAL PRODUCTS */}

                <div className="stat-card">

                    <div className="stat-card-top">

                        <div className="stat-icon">
                            <Package size={18} />
                        </div>

                    </div>

                    <span>
                        Total Products
                    </span>

                    <strong>
                        {summary.total_products}
                    </strong>

                </div>


                {/* WAREHOUSES */}

                <div className="stat-card">

                    <div className="stat-card-top">

                        <div className="stat-icon">
                            <Warehouse size={18} />
                        </div>

                    </div>

                    <span>
                        Warehouses
                    </span>

                    <strong>
                        {summary.total_warehouses}
                    </strong>

                </div>


                {/* TOTAL STOCK */}

                <div className="stat-card">

                    <div className="stat-card-top">

                        <div className="stat-icon">
                            <Boxes size={18} />
                        </div>

                    </div>

                    <span>
                        Total Stock Quantity
                    </span>

                    <strong>
                        {summary.total_stock_units}
                    </strong>

                </div>


                {/* LOW STOCK */}

                <div className="stat-card warning-card">

                    <div className="stat-card-top">

                        <div className="stat-icon warning">
                            <AlertTriangle size={18} />
                        </div>

                    </div>

                    <span>
                        Low Stock Items
                    </span>

                    <strong>
                        {summary.low_stock_products}
                    </strong>

                </div>

            </div>


            {/* =========================================
                MAIN DASHBOARD GRID
            ========================================= */}

            <div className="dashboard-grid">


                {/* =====================================
                    RECENT MOVEMENTS
                ===================================== */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Recent Movements
                            </h2>

                            <p>
                                Latest inventory activity
                            </p>

                        </div>

                    </div>


                    <div className="movement-list">

                        {movements.length === 0 ? (

                            <div className="empty-state">
                                No recent movements
                            </div>

                        ) : (

                            movements.map((movement) => (

                                <div
                                    className="movement-row"
                                    key={movement.id}
                                >

                                    <div className="movement-main">

                                        <div className="movement-icon">
                                            <Boxes size={16} />
                                        </div>


                                        <div>

                                            <strong>
                                                {movement.product}
                                            </strong>

                                            <span>
                                                {movement.sku}
                                                {" • "}
                                                {movement.warehouse}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="movement-info">

                                        <span className="movement-type">

                                            {movementTypeLabel(
                                                movement.movement_type
                                            )}

                                        </span>


                                        <strong
                                            className={
                                                movementClass(
                                                    Number(
                                                        movement.quantity_change
                                                    )
                                                )
                                            }
                                        >

                                            {Number(
                                                movement.quantity_change
                                            ) > 0
                                                ? `+${movement.quantity_change}`
                                                : movement.quantity_change
                                            }

                                        </strong>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </section>


                {/* =====================================
                    OPERATIONS
                ===================================== */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Operations
                            </h2>

                            <p>
                                Current transaction status
                            </p>

                        </div>

                    </div>


                    <div className="operation-list">


                        {/* PENDING RECEIPTS */}

                        <div className="operation-item">

                            <div className="operation-label">

                                <span className="operation-icon">
                                    <ClipboardList size={16} />
                                </span>

                                <span>
                                    Pending Receipts
                                </span>

                            </div>

                            <strong>
                                {summary.pending_receipts}
                            </strong>

                        </div>


                        {/* PENDING DELIVERIES */}

                        <div className="operation-item">

                            <div className="operation-label">

                                <span className="operation-icon">
                                    <Truck size={16} />
                                </span>

                                <span>
                                    Pending Deliveries
                                </span>

                            </div>

                            <strong>
                                {summary.pending_deliveries}
                            </strong>

                        </div>


                        {/* PENDING TRANSFERS */}

                        <div className="operation-item">

                            <div className="operation-label">

                                <span className="operation-icon">
                                    <ArrowLeftRight size={16} />
                                </span>

                                <span>
                                    Pending Transfers
                                </span>

                            </div>

                            <strong>
                                {summary.pending_transfers}
                            </strong>

                        </div>


                        {/* OUT OF STOCK */}

                        <div className="operation-item">

                            <div className="operation-label">

                                <span className="operation-icon warning">
                                    <AlertTriangle size={16} />
                                </span>

                                <span>
                                    Out of Stock
                                </span>

                            </div>

                            <strong
                                className={
                                    summary.out_of_stock_products > 0
                                        ? "danger-number"
                                        : ""
                                }
                            >
                                {summary.out_of_stock_products}
                            </strong>

                        </div>


                    </div>

                </section>


            </div>

        </div>

    );

}


export default Dashboard;