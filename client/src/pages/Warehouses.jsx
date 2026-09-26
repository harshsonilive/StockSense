import { useEffect, useState } from "react";

import {
    Warehouse,
    RefreshCw,
    Search,
    MapPin,
    Building2,
    ChevronRight,
    AlertCircle
} from "lucide-react";

import { getWarehouses } from "../services/api";


function Warehouses() {

    const [warehouses, setWarehouses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [error, setError] = useState("");


    const loadWarehouses = async (refresh = false) => {

        try {

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getWarehouses();

            setWarehouses(
                Array.isArray(data)
                    ? data
                    : data.warehouses || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load warehouses."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    useEffect(() => {
        loadWarehouses();
    }, []);


    const filteredWarehouses =
        warehouses.filter((warehouse) => {

            const text =
                search.toLowerCase().trim();

            return (
                String(warehouse.name || "")
                    .toLowerCase()
                    .includes(text) ||

                String(warehouse.type || "")
                    .toLowerCase()
                    .includes(text) ||

                String(warehouse.parent_location || "")
                    .toLowerCase()
                    .includes(text)
            );
        });


    if (loading) {

        return (
            <div className="dashboard-state">

                <Warehouse size={25} />

                <p>
                    Loading warehouses...
                </p>

            </div>
        );
    }


    if (error) {

        return (
            <div className="dashboard-state">

                <AlertCircle size={25} />

                <p>{error}</p>

                <button
                    className="secondary-button"
                    onClick={() => loadWarehouses()}
                >
                    Try Again
                </button>

            </div>
        );
    }


    return (
        <div className="page">

            {/* Header */}

            <div className="page-header">

                <div>

                    <h1>
                        Warehouses
                    </h1>

                    <p>
                        Manage your warehouse locations
                    </p>

                </div>


                <div className="page-header-actions">

                    <button
                        className="refresh-button"
                        onClick={() =>
                            loadWarehouses(true)
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

                </div>

            </div>


            {/* Summary */}

            <div className="summary-grid">

                <div className="summary-card">

                    <div className="summary-icon">
                        <Warehouse size={19} />
                    </div>

                    <div>

                        <span>
                            Total Locations
                        </span>

                        <strong>
                            {warehouses.length}
                        </strong>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        <Building2 size={19} />
                    </div>

                    <div>

                        <span>
                            Warehouses
                        </span>

                        <strong>
                            {
                                warehouses.filter(
                                    item =>
                                        item.type ===
                                        "Warehouse"
                                ).length
                            }
                        </strong>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        <MapPin size={19} />
                    </div>

                    <div>

                        <span>
                            Internal Locations
                        </span>

                        <strong>
                            {
                                warehouses.filter(
                                    item =>
                                        item.type !==
                                        "Warehouse"
                                ).length
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* Main table */}

            <section className="content-card">

                <div className="content-toolbar">

                    <div className="toolbar-title">

                        <div className="toolbar-icon">
                            <Warehouse size={17} />
                        </div>

                        <div>

                            <strong>
                                Location Structure
                            </strong>

                            <span>
                                {
                                    warehouses.length
                                } locations
                            </span>

                        </div>

                    </div>


                    <div className="table-search">

                        <Search size={15} />

                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {filteredWarehouses.length === 0 ? (

                    <div className="empty-state">

                        <Warehouse size={28} />

                        <strong>
                            No locations found
                        </strong>

                        <span>
                            Try changing your search.
                        </span>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        LOCATION
                                    </th>

                                    <th>
                                        TYPE
                                    </th>

                                    <th>
                                        PARENT LOCATION
                                    </th>

                                    <th>
                                        ID
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredWarehouses.map(
                                    (warehouse) => (

                                        <tr
                                            key={
                                                warehouse.id
                                            }
                                        >

                                            <td>

                                                <div className="product-cell">

                                                    <div className="product-icon">

                                                        {warehouse.type ===
                                                        "Warehouse" ? (
                                                            <Warehouse
                                                                size={17}
                                                            />
                                                        ) : (
                                                            <MapPin
                                                                size={17}
                                                            />
                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                warehouse.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            Location #
                                                            {
                                                                warehouse.id
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="status-badge">

                                                    {
                                                        warehouse.type
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {warehouse.parent_location ? (

                                                    <div className="parent-location">

                                                        <ChevronRight
                                                            size={14}
                                                        />

                                                        {
                                                            warehouse.parent_location
                                                        }

                                                    </div>

                                                ) : (

                                                    <span className="muted">
                                                        Root location
                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                <span className="sku">
                                                    #
                                                    {
                                                        warehouse.id
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

        </div>
    );
}


export default Warehouses;