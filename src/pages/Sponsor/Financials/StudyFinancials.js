import React, { useMemo, useState } from "react";
import "./StudyFinancials.css";
import { payments, receivables, invoiceData } from "./FinancialMockData";

const INITIAL_BUDGET_FORM = {
  name: "",
  category: "",
  amount: "",
  startDate: "",
  endDate: "",
  status: "Active",
  description: "",
};

const INITIAL_PAYMENT_FORM = {
  milestone: "",
  amount: "",
  paidOn: "",
  status: "Pending",
  notes: "",
};

const INITIAL_RECEIVABLE_FORM = {
  payer: "",
  amount: "",
  dueDate: "",
  status: "Pending",
};

const INITIAL_INVOICE_FORM = {
  invoiceNo: "",
  payer: "",
  amount: "",
  issueDate: "",
  dueDate: "",
  status: "Pending",
};

const getStatusClassName = (status) => {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const statusMap = {
    active: "financial-status-active",
    paid: "financial-status-paid",
    pending: "financial-status-pending",
    upcoming: "financial-status-upcoming",
    received: "financial-status-paid",
    overdue: "financial-status-pending",
    draft: "financial-status-upcoming",
    closed: "financial-status-pending",
  };

  return statusMap[normalizedStatus] || "financial-status-upcoming";
};

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("en-US")}`;

function StudyFinancials() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showAllData, setShowAllData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const [budgets, setBudgets] = useState([
    {
      id: 1,
      name: "Initial Study Budget",
      category: "Clinical Operations",
      amount: 2500000,
      startDate: "2026-07-01",
      endDate: "2027-06-30",
      status: "Active",
      description: "Initial approved study budget",
    },
  ]);

  const [paymentList, setPaymentList] = useState(payments);
  const [receivableList, setReceivableList] = useState(receivables);
  const [invoiceList, setInvoiceList] = useState(invoiceData);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceivableModal, setShowReceivableModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [budgetForm, setBudgetForm] = useState(INITIAL_BUDGET_FORM);
  const [paymentForm, setPaymentForm] = useState(INITIAL_PAYMENT_FORM);
  const [receivableForm, setReceivableForm] = useState(
    INITIAL_RECEIVABLE_FORM,
  );
  const [invoiceForm, setInvoiceForm] = useState(INITIAL_INVOICE_FORM);

  const [editBudgetId, setEditBudgetId] = useState(null);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editReceivableId, setEditReceivableId] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);

  const [deleteReason, setDeleteReason] = useState("");
  const [deleteType, setDeleteType] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const rowsPerPage = 5;

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredPaymentList = useMemo(() => {
    return paymentList.filter((payment) => {
      const matchesSearch = String(payment.milestone || "")
        .toLowerCase()
        .includes(normalizedSearchTerm);

      const matchesStatus =
        selectedFilter === "All" || payment.status === selectedFilter;

      return matchesSearch && matchesStatus;
    });
  }, [paymentList, normalizedSearchTerm, selectedFilter]);

  const filteredReceivableList = useMemo(() => {
    return receivableList.filter((receivable) => {
      return (
        String(receivable.payer || "")
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        String(receivable.status || "")
          .toLowerCase()
          .includes(normalizedSearchTerm)
      );
    });
  }, [receivableList, normalizedSearchTerm]);

  const filteredInvoiceList = useMemo(() => {
    return invoiceList.filter((invoice) => {
      return (
        String(invoice.invoiceNo || "")
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        String(invoice.payer || "")
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        String(invoice.status || "")
          .toLowerCase()
          .includes(normalizedSearchTerm)
      );
    });
  }, [invoiceList, normalizedSearchTerm]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      return (
        String(budget.name || "")
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        String(budget.category || "")
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        String(budget.status || "")
          .toLowerCase()
          .includes(normalizedSearchTerm)
      );
    });
  }, [budgets, normalizedSearchTerm]);

  const sortedBudgets = useMemo(() => {
    const items = [...filteredBudgets];

    if (!sortField) {
      return items;
    }

    return items.sort((firstItem, secondItem) => {
      const firstValue = firstItem[sortField];
      const secondValue = secondItem[sortField];

      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return sortDirection === "asc"
          ? firstValue - secondValue
          : secondValue - firstValue;
      }

      const comparison = String(firstValue || "").localeCompare(
        String(secondValue || ""),
      );

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredBudgets, sortDirection, sortField]);

  const totalPages = Math.max(1, Math.ceil(sortedBudgets.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstIndex = (safeCurrentPage - 1) * rowsPerPage;
  const currentBudgets = sortedBudgets.slice(
    firstIndex,
    firstIndex + rowsPerPage,
  );

  const totalBudget = useMemo(
    () => budgets.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [budgets],
  );

  const totalPayments = useMemo(
    () =>
      paymentList.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [paymentList],
  );

  const remainingBudget = totalBudget - totalPayments;
  const utilizedPercentage =
    totalBudget > 0 ? Math.min((totalPayments / totalBudget) * 100, 100) : 0;

  const resetBudgetModal = () => {
    setBudgetForm(INITIAL_BUDGET_FORM);
    setEditBudgetId(null);
    setShowBudgetModal(false);
  };

  const resetPaymentModal = () => {
    setPaymentForm(INITIAL_PAYMENT_FORM);
    setEditPaymentId(null);
    setShowPaymentModal(false);
  };

  const resetReceivableModal = () => {
    setReceivableForm(INITIAL_RECEIVABLE_FORM);
    setEditReceivableId(null);
    setShowReceivableModal(false);
  };

  const resetInvoiceModal = () => {
    setInvoiceForm(INITIAL_INVOICE_FORM);
    setIsEditingInvoice(false);
    setShowInvoiceModal(false);
  };

  const openNewBudgetModal = () => {
    setBudgetForm(INITIAL_BUDGET_FORM);
    setEditBudgetId(null);
    setShowBudgetModal(true);
  };

  const openNewPaymentModal = () => {
    setPaymentForm(INITIAL_PAYMENT_FORM);
    setEditPaymentId(null);
    setShowPaymentModal(true);
  };

  const openNewReceivableModal = () => {
    setReceivableForm(INITIAL_RECEIVABLE_FORM);
    setEditReceivableId(null);
    setShowReceivableModal(true);
  };

  const openNewInvoiceModal = () => {
    setInvoiceForm(INITIAL_INVOICE_FORM);
    setIsEditingInvoice(false);
    setShowInvoiceModal(true);
  };

  const handleEditBudget = (budget) => {
    setBudgetForm({
      name: budget.name || "",
      category: budget.category || "",
      amount: budget.amount || "",
      startDate: budget.startDate || "",
      endDate: budget.endDate || "",
      status: budget.status || "Active",
      description: budget.description || "",
    });

    setEditBudgetId(budget.id);
    setShowBudgetModal(true);
  };

  const handleSaveBudget = () => {
    if (
      !budgetForm.name.trim() ||
      !budgetForm.category.trim() ||
      !budgetForm.amount ||
      !budgetForm.startDate ||
      !budgetForm.endDate
    ) {
      alert("Please fill all required budget fields.");
      return;
    }

    const preparedBudget = {
      ...budgetForm,
      name: budgetForm.name.trim(),
      category: budgetForm.category.trim(),
      amount: Number(budgetForm.amount),
    };

    if (editBudgetId !== null) {
      setBudgets((currentBudgets) =>
        currentBudgets.map((budget) =>
          budget.id === editBudgetId
            ? { ...budget, ...preparedBudget }
            : budget,
        ),
      );
    } else {
      setBudgets((currentBudgets) => [
        ...currentBudgets,
        {
          id: Date.now(),
          ...preparedBudget,
        },
      ]);
    }

    resetBudgetModal();
  };

  const handleEditPayment = (payment) => {
    setPaymentForm({
      milestone: payment.milestone || "",
      amount: payment.amount || "",
      paidOn: payment.paidOn || "",
      status: payment.status || "Pending",
      notes: payment.notes || "",
    });

    setEditPaymentId(payment.id);
    setShowPaymentModal(true);
  };

  const handleSavePayment = () => {
    if (
      !paymentForm.milestone.trim() ||
      !paymentForm.amount ||
      !paymentForm.paidOn
    ) {
      alert("Please fill all required payment fields.");
      return;
    }

    const preparedPayment = {
      milestone: paymentForm.milestone.trim(),
      amount: Number(paymentForm.amount),
      paidOn: paymentForm.paidOn,
      status: paymentForm.status,
      notes: paymentForm.notes.trim(),
    };

    if (editPaymentId !== null) {
      setPaymentList((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === editPaymentId
            ? { ...payment, ...preparedPayment }
            : payment,
        ),
      );
    } else {
      setPaymentList((currentPayments) => [
        ...currentPayments,
        {
          id: Date.now(),
          ...preparedPayment,
        },
      ]);
    }

    resetPaymentModal();
  };

  const handleEditReceivable = (receivable) => {
    setReceivableForm({
      payer: receivable.payer || "",
      amount: receivable.amount || "",
      dueDate: receivable.dueDate || "",
      status: receivable.status || "Pending",
    });

    setEditReceivableId(receivable.id);
    setShowReceivableModal(true);
  };

  const handleSaveReceivable = () => {
    if (
      !receivableForm.payer.trim() ||
      !receivableForm.amount ||
      !receivableForm.dueDate
    ) {
      alert("Please fill all required receivable fields.");
      return;
    }

    const preparedReceivable = {
      payer: receivableForm.payer.trim(),
      amount: Number(receivableForm.amount),
      dueDate: receivableForm.dueDate,
      status: receivableForm.status,
    };

    if (editReceivableId !== null) {
      setReceivableList((currentReceivables) =>
        currentReceivables.map((receivable) =>
          receivable.id === editReceivableId
            ? { ...receivable, ...preparedReceivable }
            : receivable,
        ),
      );
    } else {
      setReceivableList((currentReceivables) => [
        ...currentReceivables,
        {
          id: Date.now(),
          ...preparedReceivable,
        },
      ]);
    }

    resetReceivableModal();
  };

  const handleEditInvoice = (invoice) => {
    setInvoiceForm({
      id: invoice.id,
      invoiceNo: invoice.invoiceNo || "",
      payer: invoice.payer || "",
      amount: invoice.amount || "",
      issueDate: invoice.issueDate || "",
      dueDate: invoice.dueDate || "",
      status: invoice.status || "Pending",
    });

    setIsEditingInvoice(true);
    setShowInvoiceModal(true);
  };

  const handleSaveInvoice = () => {
    if (
      !invoiceForm.invoiceNo.trim() ||
      !invoiceForm.payer.trim() ||
      !invoiceForm.amount ||
      !invoiceForm.issueDate ||
      !invoiceForm.dueDate
    ) {
      alert("Please fill all required invoice fields.");
      return;
    }

    const preparedInvoice = {
      invoiceNo: invoiceForm.invoiceNo.trim(),
      payer: invoiceForm.payer.trim(),
      amount: Number(invoiceForm.amount),
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      status: invoiceForm.status,
    };

    if (isEditingInvoice) {
      setInvoiceList((currentInvoices) =>
        currentInvoices.map((invoice) =>
          invoice.id === invoiceForm.id
            ? { ...invoice, ...preparedInvoice }
            : invoice,
        ),
      );
    } else {
      setInvoiceList((currentInvoices) => [
        ...currentInvoices,
        {
          id: Date.now(),
          ...preparedInvoice,
        },
      ]);
    }

    resetInvoiceModal();
  };

  const openDeleteModal = (type, id) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteReason("");
    setDeleteId(null);
    setDeleteType("");
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    if (!deleteReason.trim()) {
      alert("Please enter the reason for deletion.");
      return;
    }

    if (deleteType === "budget") {
      setBudgets((currentBudgets) =>
        currentBudgets.filter((budget) => budget.id !== deleteId),
      );
    }

    if (deleteType === "payment") {
      setPaymentList((currentPayments) =>
        currentPayments.filter((payment) => payment.id !== deleteId),
      );
    }

    if (deleteType === "receivable") {
      setReceivableList((currentReceivables) =>
        currentReceivables.filter((receivable) => receivable.id !== deleteId),
      );
    }

    if (deleteType === "invoice") {
      setInvoiceList((currentInvoices) =>
        currentInvoices.filter((invoice) => invoice.id !== deleteId),
      );
    }

    closeDeleteModal();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) {
      return "";
    }

    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const escapeCsvValue = (value) => {
    const text = String(value ?? "");

    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  const exportToCSV = () => {
    const rows = [
      ["Study Budgets"],
      ["Budget Name", "Category", "Amount", "Status", "Start Date", "End Date"],
      ...filteredBudgets.map((budget) => [
        budget.name,
        budget.category,
        budget.amount,
        budget.status,
        budget.startDate,
        budget.endDate,
      ]),
      [],
      ["Payments"],
      ["Milestone", "Amount", "Paid On", "Status", "Notes"],
      ...filteredPaymentList.map((payment) => [
        payment.milestone,
        payment.amount,
        payment.paidOn,
        payment.status,
        payment.notes || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "study-financials.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="financial-page">
      <div className="financial-header">
        <div>
          <h2>Study Financials</h2>
          <p>Manage study budgets, payments, receivables, and invoices.</p>

          <input
            type="search"
            placeholder="Search budgets, payments, receivables..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="financial-search"
          />
        </div>

        <div className="financial-filter">
          <label htmlFor="financial-status-filter">Payment status</label>

          <select
            id="financial-status-filter"
            value={selectedFilter}
            onChange={(event) => setSelectedFilter(event.target.value)}
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      <div className="financial-cards">
        <div className="financial-card">
          <h4>Total Budget</h4>
          <h2>{formatCurrency(totalBudget)}</h2>
        </div>

        <div className="financial-card">
          <h4>Budget Utilized</h4>
          <h2>{formatCurrency(totalPayments)}</h2>
          <p>{utilizedPercentage.toFixed(1)}% of total budget</p>
        </div>

        <div className="financial-card">
          <h4>Remaining Budget</h4>
          <h2>{formatCurrency(remainingBudget)}</h2>
        </div>

        <div className="financial-card">
          <h4>Budget Status</h4>
          <span
            className={`financial-status ${
              remainingBudget >= 0
                ? "financial-status-active"
                : "financial-status-pending"
            }`}
          >
            {remainingBudget >= 0 ? "Healthy" : "Exceeded"}
          </span>
          <p>Budgets created: {budgets.length}</p>
        </div>
      </div>

      <div className="financial-actions">
        <button type="button" onClick={openNewBudgetModal}>
          + New Budget
        </button>

        <button type="button" onClick={openNewPaymentModal}>
          + New Payment
        </button>

        <button type="button" onClick={openNewReceivableModal}>
          + New Receivable
        </button>

        <button type="button" onClick={openNewInvoiceModal}>
          + New Invoice
        </button>

        <button
          type="button"
          onClick={() => setShowAllData((currentValue) => !currentValue)}
        >
          {showAllData ? "Hide Summary" : "View Summary"}
        </button>

        <button type="button" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>

      {showAllData && (
        <section className="financial-summary">
          <h2>Financial Summary</h2>

          <div className="financial-summary-card">
            <p>
              Total Budgets: <b>{budgets.length}</b>
            </p>

            <p>
              Total Payments: <b>{paymentList.length}</b>
            </p>

            <p>
              Budget Utilized: <b>{formatCurrency(totalPayments)}</b>
            </p>

            <p>
              Remaining Budget: <b>{formatCurrency(remainingBudget)}</b>
            </p>
          </div>
        </section>
      )}

      <section className="budget-list">
        <h3>Study Budgets</h3>
      </section>

      <div className="budget-table">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("name")}>
                Budget Name{getSortIndicator("name")}
              </th>
              <th onClick={() => handleSort("category")}>
                Category{getSortIndicator("category")}
              </th>
              <th onClick={() => handleSort("amount")}>
                Amount{getSortIndicator("amount")}
              </th>
              <th onClick={() => handleSort("status")}>
                Status{getSortIndicator("status")}
              </th>
              <th onClick={() => handleSort("startDate")}>
                Start Date{getSortIndicator("startDate")}
              </th>
              <th onClick={() => handleSort("endDate")}>
                End Date{getSortIndicator("endDate")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentBudgets.length === 0 ? (
              <tr>
                <td colSpan="7">No budgets found.</td>
              </tr>
            ) : (
              currentBudgets.map((budget) => (
                <tr key={budget.id}>
                  <td>{budget.name}</td>
                  <td>{budget.category}</td>
                  <td>{formatCurrency(budget.amount)}</td>
                  <td>
                    <span
                      className={`financial-status ${getStatusClassName(
                        budget.status,
                      )}`}
                    >
                      {budget.status}
                    </span>
                  </td>
                  <td>{budget.startDate}</td>
                  <td>{budget.endDate}</td>
                  <td>
                    <button
                      type="button"
                      className="financial-action-btn"
                      onClick={() => handleEditBudget(budget)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="financial-delete-btn"
                      onClick={() => openDeleteModal("budget", budget.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="financial-pagination">
        <button
          type="button"
          disabled={safeCurrentPage === 1}
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
        >
          Previous
        </button>

        <span>
          Page {safeCurrentPage} of {totalPages}
        </span>

        <button
          type="button"
          disabled={safeCurrentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
        >
          Next
        </button>
      </div>

      <section className="payment-table">
        <h3>Study Payments</h3>

        <table>
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Amount</th>
              <th>Paid On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPaymentList.length === 0 ? (
              <tr>
                <td colSpan="5">No payments found.</td>
              </tr>
            ) : (
              filteredPaymentList.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.milestone}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.paidOn}</td>
                  <td>
                    <span
                      className={`financial-status ${getStatusClassName(
                        payment.status,
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="financial-action-btn"
                      onClick={() => handleEditPayment(payment)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="financial-delete-btn"
                      onClick={() => openDeleteModal("payment", payment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="financial-receivable-table">
        <h3>Study Receivables</h3>

        <table>
          <thead>
            <tr>
              <th>Payer</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredReceivableList.length === 0 ? (
              <tr>
                <td colSpan="5">No receivables found.</td>
              </tr>
            ) : (
              filteredReceivableList.map((receivable) => (
                <tr key={receivable.id}>
                  <td>{receivable.payer}</td>
                  <td>{formatCurrency(receivable.amount)}</td>
                  <td>{receivable.dueDate}</td>
                  <td>
                    <span
                      className={`financial-status ${getStatusClassName(
                        receivable.status,
                      )}`}
                    >
                      {receivable.status}
                    </span>
                  </td>
                  <td>
                    <div className="financial-receivable-action-buttons">
                      <button
                        type="button"
                        className="financial-receivable-edit-btn"
                        onClick={() => handleEditReceivable(receivable)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="financial-receivable-delete-btn"
                        onClick={() =>
                          openDeleteModal("receivable", receivable.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="financial-receivable-table">
        <h3>Study Invoices</h3>

        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Payer</th>
              <th>Amount</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoiceList.length === 0 ? (
              <tr>
                <td colSpan="7">No invoices found.</td>
              </tr>
            ) : (
              filteredInvoiceList.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNo}</td>
                  <td>{invoice.payer}</td>
                  <td>{formatCurrency(invoice.amount)}</td>
                  <td>{invoice.issueDate}</td>
                  <td>{invoice.dueDate}</td>
                  <td>
                    <span
                      className={`financial-status ${getStatusClassName(
                        invoice.status,
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="financial-receivable-action-buttons">
                      <button
                        type="button"
                        className="financial-receivable-edit-btn"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="financial-receivable-delete-btn"
                        onClick={() => openDeleteModal("invoice", invoice.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {showBudgetModal && (
        <div className="financial-modal-overlay">
          <div className="financial-modal" role="dialog" aria-modal="true">
            <h2>
              {editBudgetId !== null
                ? "Edit Study Budget"
                : "New Study Budget"}
            </h2>

            <div className="financial-form">
              <label className="financial-form-label">Budget Name</label>
              <input
                type="text"
                value={budgetForm.name}
                onChange={(event) =>
                  setBudgetForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Budget Category</label>
              <input
                type="text"
                value={budgetForm.category}
                onChange={(event) =>
                  setBudgetForm((currentForm) => ({
                    ...currentForm,
                    category: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Budget Amount</label>
              <input
                type="number"
                min="0"
                value={budgetForm.amount}
                onChange={(event) =>
                  setBudgetForm((currentForm) => ({
                    ...currentForm,
                    amount: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Start Date</label>
              <input
                type="date"
                value={budgetForm.startDate}
                onChange={(event) =>
                  setBudgetForm((currentForm) => ({
                    ...currentForm,
                    startDate: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">End Date</label>
              <input
                type="date"
                value={budgetForm.endDate}
                onChange={(event) =>
                  setBudgetForm((currentForm) => ({
                    ...currentForm,
                    endDate: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Budget Status</label>
              <select
                value={budgetForm.status}
                onChange={(event) =>
                  setBudgetForm((currentForm) => ({
                    ...currentForm,
                    status: event.target.value,
                  }))
                }
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>

              <label className="financial-form-label">
                Budget Description
              </label>
              <textarea
                rows="4"
                value={budgetForm.description}
                onChange={(event) =>
                  setBudgetForm((currentForm) => ({
                    ...currentForm,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="financial-modal-actions">
              <button type="button" onClick={resetBudgetModal}>
                Cancel
              </button>

              <button type="button" onClick={handleSaveBudget}>
                {editBudgetId !== null ? "Update Budget" : "Save Budget"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="financial-modal-overlay">
          <div className="financial-modal" role="dialog" aria-modal="true">
            <h2>
              {editPaymentId !== null ? "Edit Payment" : "New Payment"}
            </h2>

            <div className="financial-form">
              <label className="financial-form-label">Milestone</label>
              <input
                type="text"
                value={paymentForm.milestone}
                onChange={(event) =>
                  setPaymentForm((currentForm) => ({
                    ...currentForm,
                    milestone: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Amount</label>
              <input
                type="number"
                min="0"
                value={paymentForm.amount}
                onChange={(event) =>
                  setPaymentForm((currentForm) => ({
                    ...currentForm,
                    amount: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Payment Date</label>
              <input
                type="date"
                value={paymentForm.paidOn}
                onChange={(event) =>
                  setPaymentForm((currentForm) => ({
                    ...currentForm,
                    paidOn: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Payment Status</label>
              <select
                value={paymentForm.status}
                onChange={(event) =>
                  setPaymentForm((currentForm) => ({
                    ...currentForm,
                    status: event.target.value,
                  }))
                }
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Upcoming">Upcoming</option>
              </select>

              <label className="financial-form-label">Notes</label>
              <textarea
                rows="4"
                value={paymentForm.notes}
                onChange={(event) =>
                  setPaymentForm((currentForm) => ({
                    ...currentForm,
                    notes: event.target.value,
                  }))
                }
              />
            </div>

            <div className="financial-modal-actions">
              <button type="button" onClick={resetPaymentModal}>
                Cancel
              </button>

              <button type="button" onClick={handleSavePayment}>
                {editPaymentId !== null ? "Update Payment" : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceivableModal && (
        <div className="financial-modal-overlay">
          <div className="financial-modal" role="dialog" aria-modal="true">
            <h2>
              {editReceivableId !== null
                ? "Edit Receivable"
                : "New Receivable"}
            </h2>

            <div className="financial-form">
              <label className="financial-form-label">Payer</label>
              <input
                type="text"
                value={receivableForm.payer}
                onChange={(event) =>
                  setReceivableForm((currentForm) => ({
                    ...currentForm,
                    payer: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Amount</label>
              <input
                type="number"
                min="0"
                value={receivableForm.amount}
                onChange={(event) =>
                  setReceivableForm((currentForm) => ({
                    ...currentForm,
                    amount: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Due Date</label>
              <input
                type="date"
                value={receivableForm.dueDate}
                onChange={(event) =>
                  setReceivableForm((currentForm) => ({
                    ...currentForm,
                    dueDate: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">
                Receivable Status
              </label>
              <select
                value={receivableForm.status}
                onChange={(event) =>
                  setReceivableForm((currentForm) => ({
                    ...currentForm,
                    status: event.target.value,
                  }))
                }
              >
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="financial-modal-actions">
              <button type="button" onClick={resetReceivableModal}>
                Cancel
              </button>

              <button type="button" onClick={handleSaveReceivable}>
                {editReceivableId !== null
                  ? "Update Receivable"
                  : "Save Receivable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="financial-modal-overlay">
          <div className="financial-modal" role="dialog" aria-modal="true">
            <h2>{isEditingInvoice ? "Edit Invoice" : "New Invoice"}</h2>

            <div className="financial-form">
              <label className="financial-form-label">Invoice Number</label>
              <input
                type="text"
                value={invoiceForm.invoiceNo}
                onChange={(event) =>
                  setInvoiceForm((currentForm) => ({
                    ...currentForm,
                    invoiceNo: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Payer</label>
              <input
                type="text"
                value={invoiceForm.payer}
                onChange={(event) =>
                  setInvoiceForm((currentForm) => ({
                    ...currentForm,
                    payer: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Amount</label>
              <input
                type="number"
                min="0"
                value={invoiceForm.amount}
                onChange={(event) =>
                  setInvoiceForm((currentForm) => ({
                    ...currentForm,
                    amount: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Issue Date</label>
              <input
                type="date"
                value={invoiceForm.issueDate}
                onChange={(event) =>
                  setInvoiceForm((currentForm) => ({
                    ...currentForm,
                    issueDate: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Due Date</label>
              <input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(event) =>
                  setInvoiceForm((currentForm) => ({
                    ...currentForm,
                    dueDate: event.target.value,
                  }))
                }
              />

              <label className="financial-form-label">Invoice Status</label>
              <select
                value={invoiceForm.status}
                onChange={(event) =>
                  setInvoiceForm((currentForm) => ({
                    ...currentForm,
                    status: event.target.value,
                  }))
                }
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="financial-modal-actions">
              <button type="button" onClick={resetInvoiceModal}>
                Cancel
              </button>

              <button type="button" onClick={handleSaveInvoice}>
                {isEditingInvoice ? "Update Invoice" : "Save Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="financial-modal-overlay">
          <div className="financial-modal" role="dialog" aria-modal="true">
            <h2>Delete Confirmation</h2>

            <p>Are you sure you want to delete this {deleteType}?</p>

            <div className="financial-form">
              <label className="financial-form-label">
                Reason for Delete *
              </label>

              <textarea
                rows="4"
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                placeholder="Enter reason..."
              />
            </div>

            <div className="financial-modal-actions">
              <button type="button" onClick={closeDeleteModal}>
                Cancel
              </button>

              <button
                type="button"
                className="financial-receivable-delete-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyFinancials;