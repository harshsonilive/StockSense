import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Products from "./pages/Products";
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

                </Routes>

            </Layout>

        </BrowserRouter>
    );
}

export default App;