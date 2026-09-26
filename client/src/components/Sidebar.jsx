import {
    LayoutDashboard,
    Package,
    Warehouse,
    Boxes,
    ClipboardList,
    Truck,
    ArrowLeftRight,
    Settings
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {

    const navigation = [
        {
            name: "Dashboard",
            path: "/",
            icon: LayoutDashboard
        },
        {
            name: "Products",
            path: "/products",
            icon: Package
        },
        {
            name: "Inventory",
            path: "/inventory",
            icon: Boxes
        },
        {
            name: "Warehouses",
            path: "/warehouses",
            icon: Warehouse
        },
        {
            name: "Receipts",
            path: "/receipts",
            icon: ClipboardList
        },
        {
            name: "Deliveries",
            path: "/deliveries",
            icon: Truck
        },
        {
            name: "Transfers",
            path: "/transfers",
            icon: ArrowLeftRight
        }
    ];


    return (
        <aside className="sidebar">

            <div className="brand">

                <div className="brand-mark">
                    S
                </div>

                <div>
                    <h2>StockSense</h2>
                    <span>Inventory Control</span>
                </div>

            </div>


            <nav className="sidebar-nav">

                <div className="nav-section-title">
                    WORKSPACE
                </div>

                {navigation.map((item) => {

                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >

                            <Icon size={19} strokeWidth={1.8} />

                            <span>
                                {item.name}
                            </span>

                        </NavLink>
                    );

                })}

            </nav>


            <div className="sidebar-bottom">

                <NavLink
                    to="/settings"
                    className="nav-item"
                >
                    <Settings
                        size={19}
                        strokeWidth={1.8}
                    />

                    <span>
                        Settings
                    </span>
                </NavLink>


                <div className="user-card">

                    <div className="user-avatar">
                        A
                    </div>

                    <div className="user-info">
                        <strong>Administrator</strong>
                        <span>Inventory Manager</span>
                    </div>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;