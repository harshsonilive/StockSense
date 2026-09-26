import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  Search,
  X
} from "lucide-react";

import {
  getTransfers,
  getWarehouses,
  getProducts,
  createTransfer,
  validateTransfer
} from "../services/api";


function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    reference_no: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    product_id: "",
    quantity: ""
  });


  // --------------------------------------------------
  // LOAD TRANSFERS, WAREHOUSES AND PRODUCTS
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        transferData,
        warehouseData,
        productData
      ] = await Promise.all([
        getTransfers(),
        getWarehouses(),
        getProducts()
      ]);


      // -----------------------------
      // TRANSFERS
      // -----------------------------

      const transferList = Array.isArray(transferData)
        ? transferData
        : transferData?.transfers ||
          transferData?.data ||
          [];

      setTransfers(transferList);


      // -----------------------------
      // WAREHOUSES
      // -----------------------------

      const warehouseList = Array.isArray(warehouseData)
        ? warehouseData
        : warehouseData?.warehouses ||
          warehouseData?.locations ||
          warehouseData?.data ||
          [];

      setWarehouses(warehouseList);


      // -----------------------------
      // PRODUCTS
      // -----------------------------

      const productList = Array.isArray(productData)
        ? productData
        : productData?.products ||
          productData?.data ||
          [];

      setProducts(productList);

    } catch (err) {
      console.error("Transfer loading error:", err);

      setError(
        err?.message ||
        "Failed to load transfer data"
      );

    } finally {
      setLoading(false);
    }
  };


  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);


  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  // --------------------------------------------------
  // OPEN NEW TRANSFER FORM
  // --------------------------------------------------

  const openTransferForm = () => {
    setError("");

    setForm({
      reference_no: `TRF-${String(transfers.length + 1).padStart(3, "0")}`,
      from_warehouse_id: "",
      to_warehouse_id: "",
      product_id: "",
      quantity: ""
    });

    setShowForm(true);
  };


  // --------------------------------------------------
  // CREATE TRANSFER
  // --------------------------------------------------

  const handleCreateTransfer = async (e) => {
    e.preventDefault();

    setError("");


    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!form.reference_no.trim()) {
      setError("Reference number is required.");
      return;
    }


    if (!form.from_warehouse_id) {
      setError("Please select a source warehouse.");
      return;
    }


    if (!form.to_warehouse_id) {
      setError("Please select a destination warehouse.");
      return;
    }


    if (
      String(form.from_warehouse_id) ===
      String(form.to_warehouse_id)
    ) {
      setError(
        "Source and destination must be different."
      );

      return;
    }


    if (!form.product_id) {
      setError("Please select a product.");
      return;
    }


    if (
      !form.quantity ||
      Number(form.quantity) <= 0
    ) {
      setError(
        "Quantity must be greater than zero."
      );

      return;
    }


    try {
      setSubmitting(true);


      // -----------------------------
      // CALL API
      // -----------------------------

      await createTransfer({
        reference_no: form.reference_no.trim(),

        from_warehouse_id:
          Number(form.from_warehouse_id),

        to_warehouse_id:
          Number(form.to_warehouse_id),

        items: [
          {
            product_id:
              Number(form.product_id),

            quantity:
              Number(form.quantity)
          }
        ]
      });


      // -----------------------------
      // RESET FORM
      // -----------------------------

      setForm({
        reference_no: "",
        from_warehouse_id: "",
        to_warehouse_id: "",
        product_id: "",
        quantity: ""
      });


      setShowForm(false);


      // -----------------------------
      // REFRESH DATA
      // -----------------------------

      await loadData();

    } catch (err) {
      console.error(
        "Create transfer error:",
        err
      );

      setError(
        err?.message ||
        "Failed to create transfer"
      );

    } finally {
      setSubmitting(false);
    }
  };


  // --------------------------------------------------
  // VALIDATE TRANSFER
  // --------------------------------------------------

  const handleValidateTransfer = async (id) => {
    try {
      setError("");

      await validateTransfer(id);

      await loadData();

    } catch (err) {
      console.error(
        "Transfer validation error:",
        err
      );

      setError(
        err?.message ||
        "Failed to validate transfer"
      );
    }
  };


  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredTransfers = transfers.filter(
    (transfer) => {

      const search =
        searchTerm.toLowerCase();

      return (
        String(
          transfer.reference_no || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          transfer.from_warehouse ||
          transfer.from_location ||
          transfer.from_warehouse_name ||
          ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          transfer.to_warehouse ||
          transfer.to_location ||
          transfer.to_warehouse_name ||
          ""
        )
          .toLowerCase()
          .includes(search)
      );
    }
  );


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="page">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="page-header">

        <div>

          <h1>
            Transfers
          </h1>

          <p>
            Move inventory between locations
          </p>

        </div>


        <div className="page-header-actions">

          <button
            className="refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={15} />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>


          <button
            className="primary-button"
            onClick={openTransferForm}
          >
            <Plus size={16} />

            New Transfer
          </button>

        </div>

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}


      {/* ==========================================
          TRANSFER HISTORY
      ========================================== */}

      <section className="content-card">

        <div className="content-toolbar">

          <div className="toolbar-title">

            <div className="toolbar-icon">
              <ArrowLeftRight size={17} />
            </div>


            <div>

              <strong>
                Transfer History
              </strong>

              <span>
                {filteredTransfers.length}{" "}
                {filteredTransfers.length === 1
                  ? "transfer"
                  : "transfers"}
              </span>

            </div>

          </div>


          {/* SEARCH */}

          <div className="table-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (

          <div className="empty-state">
            Loading transfers...
          </div>

        ) : filteredTransfers.length === 0 ? (

          /* ====================================
             EMPTY
          ==================================== */

          <div className="empty-state">

            <ArrowLeftRight size={30} />

            <strong>
              {searchTerm
                ? "No matching transfers"
                : "No transfers yet"}
            </strong>

            <span>
              {searchTerm
                ? "Try another search."
                : "Create your first inventory transfer."}
            </span>

          </div>

        ) : (

          /* ====================================
             TABLE
          ==================================== */

          <div className="table-wrapper">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    REFERENCE
                  </th>

                  <th>
                    FROM
                  </th>

                  <th>
                    TO
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredTransfers.map(
                  (transfer) => {

                    const status =
                      String(
                        transfer.status ||
                        "PENDING"
                      ).toUpperCase();


                    const isCompleted =
                      status === "DONE" ||
                      status === "COMPLETED";


                    return (

                      <tr
                        key={transfer.id}
                      >

                        {/* REFERENCE */}

                        <td>

                          <strong>
                            {
                              transfer.reference_no ||
                              "—"
                            }
                          </strong>

                        </td>


                        {/* FROM */}

                        <td>

                          {
                            transfer.from_warehouse ||
                            transfer.from_location ||
                            transfer.from_warehouse_name ||
                            "—"
                          }

                        </td>


                        {/* TO */}

                        <td>

                          {
                            transfer.to_warehouse ||
                            transfer.to_location ||
                            transfer.to_warehouse_name ||
                            "—"
                          }

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className="status-badge"
                          >
                            {status}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          {!isCompleted && (

                            <button
                              className="small-action-button"
                              onClick={() =>
                                handleValidateTransfer(
                                  transfer.id
                                )
                              }
                            >
                              Validate
                            </button>

                          )}

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


      {/* ==========================================
          NEW TRANSFER MODAL
      ========================================== */}

      {showForm && (

        <div
          className="modal-overlay"
          onClick={() =>
            !submitting &&
            setShowForm(false)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  New Transfer
                </h2>

                <p>
                  Move stock between locations
                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  !submitting &&
                  setShowForm(false)
                }
                disabled={submitting}
              >

                <X size={18} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleCreateTransfer
              }
              className="form"
            >

              {/* REFERENCE */}

              <label>

                Reference Number

                <input
                  name="reference_no"
                  placeholder="TRF-001"
                  value={
                    form.reference_no
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </label>


              {/* SOURCE */}

              <label>

                From Warehouse

                <select
                  name="from_warehouse_id"
                  value={
                    form.from_warehouse_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select source
                  </option>


                  {warehouses.map(
                    (warehouse) => (

                      <option
                        key={
                          warehouse.id
                        }
                        value={
                          warehouse.id
                        }
                      >
                        {warehouse.name}
                      </option>

                    )
                  )}

                </select>

              </label>


              {/* DESTINATION */}

              <label>

                To Warehouse

                <select
                  name="to_warehouse_id"
                  value={
                    form.to_warehouse_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select destination
                  </option>


                  {warehouses.map(
                    (warehouse) => (

                      <option
                        key={
                          warehouse.id
                        }
                        value={
                          warehouse.id
                        }
                      >
                        {warehouse.name}
                      </option>

                    )
                  )}

                </select>

              </label>


              {/* PRODUCT */}

              <label>

                Product

                <select
                  name="product_id"
                  value={
                    form.product_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select product
                  </option>


                  {products.map(
                    (product) => (

                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {product.name}
                      </option>

                    )
                  )}

                </select>

              </label>


              {/* QUANTITY */}

              <label>

                Quantity

                <input
                  type="number"
                  min="1"
                  step="any"
                  name="quantity"
                  placeholder="20"
                  value={
                    form.quantity
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </label>


              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    !submitting &&
                    setShowForm(false)
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

                  {submitting
                    ? "Creating..."
                    : "Create Transfer"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Transfers;