import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Receipts from "./pages/Receipts";
import Deliveries from "./pages/Deliveries";
import Warehouses from "./pages/Warehouses";
import Transfers from "./pages/Transfers";
import "./App.css";


function App() {

    return (
        <BrowserRouter>

            <Layout>

                <Routes>

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    <Route
                        path="/inventory"
                        element={<Inventory />}
                    />

                    <Route
                        path="/receipts"
                        element={<Receipts />}
                    />

                    <Route
                        path="/deliveries"
                        element={<Deliveries />}
                    />

                    <Route
                        path="/warehouses"
                        element={<Warehouses />}
                    />

                    <Route
                        path="/transfers"
                        element={<Transfers />}
                    />

                </Routes>

            </Layout>

        </BrowserRouter>
    );
}

export default App;