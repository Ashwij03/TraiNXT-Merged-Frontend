import React, { useMemo, useState } from "react";
import "./StudyFinancials.css";
import { payments, receivables, invoiceData } from "./FinancialMockData";

const INITIAL_BUDGET_FORM = {
  name: "",
  category: "",
  costPerUnit: "",
  units: "",
  unitType: "Subjects",
  totalCost: "",
  version: "V1",
  currency: "USD",
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

const INITIAL_SUBJECT_COSTS = [
  {
    id: 1,
    subject: "SUB001",
    visit: "Visit 1",
    procedure: "Blood Test",
    cost: 50,
    quantity: 2,
    status: "Completed",
  },
  {
    id: 2,
    subject: "SUB001",
    visit: "Visit 1",
    procedure: "ECG",
    cost: 100,
    quantity: 1,
    status: "Completed",
  },
  {
    id: 3,
    subject: "SUB002",
    visit: "Visit 2",
    procedure: "MRI",
    cost: 500,
    quantity: 1,
    status: "Pending",
  },
];

const INITIAL_SUBJECT_COST_FORM = {
  subjectId: "",
  visit: "",
  procedure: "",
  cost: "",
  quantity: "",
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

const formatCurrency = (value, currency = "USD") => {
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "EUR"
      ? "€"
      : "$";

  return `${symbol}${Number(value || 0).toLocaleString("en-US")}`;
};

function StudyFinancials() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showAllData, setShowAllData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeTab, setActiveTab] = useState("budget");

  const [budgets, setBudgets] = useState([
  {
    id: 1,
    name: "Initial Study Budget",
    studyName: "Diabetes Study",

    category: "Clinical Operations",
    costPerUnit: 5000,
    units: 500,
    unitType: "Subjects",
    totalCost: 2500000,
    version: "V1",
    currency: "USD",
    startDate: "2026-07-01",
    endDate: "2027-06-30",
    status: "Active",
    description: "Initial approved study budget",
  },
]);

  const [paymentList, setPaymentList] = useState(payments);
  const [receivableList, setReceivableList] = useState(receivables);
  const [invoiceList, setInvoiceList] = useState(invoiceData);
  const [subjectCostForm, setSubjectCostForm] = useState(
  INITIAL_SUBJECT_COST_FORM
);

const [subjectCosts, setSubjectCosts] = useState(INITIAL_SUBJECT_COSTS);
const [showSubjectCostModal, setShowSubjectCostModal] = useState(false);
const [editSubjectCostId, setEditSubjectCostId] = useState(null);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceivableModal, setShowReceivableModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);
const [selectedBudget, setSelectedBudget] = useState(null);

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
  () =>
    budgets.reduce(
      (sum, item) => sum + Number(item.totalCost || 0),
      0
    ),
  [budgets]
);

  const totalPayments = useMemo(
    () =>
      paymentList.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [paymentList],
  );

  const grandTotal = useMemo(
  () =>
    subjectCosts.reduce(
      (sum, item) => sum + Number(item.cost) * Number(item.quantity),
      0
    ),
  [subjectCosts]
);

  const remainingBudget = totalBudget - totalPayments;
  const netBudgetCost =
  totalBudget - totalPayments - grandTotal;
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
  const handleBudgetPreview = (budget) => {
  setSelectedBudget(budget);
  setShowBudgetPreview(true);
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
    costPerUnit: budget.costPerUnit || "",
    units: budget.units || "",
    unitType: budget.unitType || "Subjects",
    totalCost: budget.totalCost || "",
    version: budget.version || "V1",
    currency: budget.currency || "USD",
    startDate: budget.startDate || "",
    endDate: budget.endDate || "",
    status: budget.status || "Active",
    description: budget.description || "",
  });

  setEditBudgetId(budget.id);
  setShowBudgetModal(true);
};
const updateBudgetField = (name, value) => {

  const updatedForm = {
    ...budgetForm,
    [name]: value,
  };

  const cost = Number(
    name === "costPerUnit"
      ? value
      : updatedForm.costPerUnit
  );

  const units = Number(
    name === "units"
      ? value
      : updatedForm.units
  );

  updatedForm.totalCost = cost * units;

  setBudgetForm(updatedForm);
};
const resetSubjectCostModal = () => {
  setSubjectCostForm(INITIAL_SUBJECT_COST_FORM);
  setShowSubjectCostModal(false);
};
  const handleSaveBudget = () => {
  if (
  !budgetForm.name.trim() ||
  !budgetForm.category.trim() ||
  !budgetForm.costPerUnit ||
  !budgetForm.units ||
  !budgetForm.startDate ||
  !budgetForm.endDate
) {
  alert("Please fill all required budget fields.");
  return;
}

if (
  Number(budgetForm.endDate.replace(/-/g, "")) <
  Number(budgetForm.startDate.replace(/-/g, ""))
) {
  alert("End Date should be after Start Date");
  return;
}
let version = budgetForm.version;

if (editBudgetId !== null) {
  const currentVersion = Number(
    budgetForm.version.replace("V", "")
  );
  

  version = `V${currentVersion + 1}`;
}
   const preparedBudget = {
  ...budgetForm,

  studyName: "Diabetes Study",

  name: budgetForm.name.trim(),
  category: budgetForm.category.trim(),
  costPerUnit: Number(budgetForm.costPerUnit),
  units: Number(budgetForm.units),
  unitType: budgetForm.unitType,
  totalCost: Number(budgetForm.totalCost),
  version,
  currency: budgetForm.currency,
  startDate: budgetForm.startDate,
  endDate: budgetForm.endDate,
  status: budgetForm.status,
  description: budgetForm.description.trim(),
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
    if (Number(paymentForm.amount) <= 0) {
  alert("Amount should be greater than zero");
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

  const handleSaveSubjectCost = () => {
  if (
    !subjectCostForm.subjectId ||
    !subjectCostForm.visit ||
    !subjectCostForm.procedure ||
    !subjectCostForm.cost ||
    !subjectCostForm.quantity
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const newCost = {
  id: editSubjectCostId ?? Date.now(),
  subject: subjectCostForm.subjectId,
  visit: subjectCostForm.visit,
  procedure: subjectCostForm.procedure,
  cost: Number(subjectCostForm.cost),
  quantity: Number(subjectCostForm.quantity),
  status: subjectCostForm.status,
};

if (editSubjectCostId !== null) {
  setSubjectCosts((prev) =>
    prev.map((item) =>
      item.id === editSubjectCostId ? newCost : item
    )
  );
} else {
  setSubjectCosts((prev) => [...prev, newCost]);
}

setEditSubjectCostId(null);
resetSubjectCostModal();
};
const handleEditSubjectCost = (item) => {
  setEditSubjectCostId(item.id);

  setSubjectCostForm({
    subjectId: item.subject,
    visit: item.visit,
    procedure: item.procedure,
    cost: item.cost,
    quantity: item.quantity,
    status: item.status,
  });

  setShowSubjectCostModal(true);
};
const handleDeleteSubjectCost = (id) => {
  openDeleteModal("subjectCost", id);
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
    if (deleteType === "subjectCost") {
  setSubjectCosts((current) =>
    current.filter((item) => item.id !== deleteId)
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
      [
  "Budget Name",
  "Category",
  "Cost Per Unit",
  "Units",
  "Unit Type",
  "Total Cost",
  "Version",
  "Currency",
  "Status",
  "Start Date",
  "End Date",
],
     ...filteredBudgets.map((budget) => [
  budget.name,
  budget.category,
  budget.costPerUnit,
  budget.units,
  budget.unitType,
  budget.totalCost,
  budget.version,
  budget.currency,
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
 <h3 className="financial-section-title">
  Budget Overview
</h3> 
      <div className="financial-cards">
        <div className="financial-card">
          <h4>Total Budget</h4>
          <h2>
{formatCurrency(
   totalBudget,
   budgets[0]?.currency
)}
</h2>
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

     <div className="budget-info-card">
  <h3>Budget Information</h3>

  <div className="budget-info-grid">
    <div>
      <span>Study</span>
      <strong>Diabetes Study</strong>
    </div>

    <div>
      <span>Protocol</span>
      <strong>DIA-001</strong>
    </div>

    <div>
      <span>Sponsor</span>
      <strong>TriaNXT</strong>
    </div>

    <div>
      <span>Principal Investigator</span>
      <strong>Dr. John</strong>
    </div>

    <div>
      <span>Site</span>
      <strong>Apollo Hospital</strong>
    </div>

    <div>
      <span>Currency</span>
      <strong>USD</strong>
    </div>
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
  onClick={() => {
    setSubjectCostForm(INITIAL_SUBJECT_COST_FORM);
    setShowSubjectCostModal(true);
  }}
>
  + New Subject Cost
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
     <div className="financial-tabs">

<button
onClick={()=>setActiveTab("budget")}
>
Budget Info
</button>

<button
onClick={()=>setActiveTab("grants")}
>
Investigator Grants
</button>

<button
onClick={()=>setActiveTab("site")}
>
Site Management
</button>

<button
onClick={()=>setActiveTab("subjects")}
>
Subject Costs
</button>

<button
onClick={()=>setActiveTab("summary")}
>
Summary
</button>

</div>

      {showAllData && (
        <section className="financial-summary">
          <h2>Financial Summary</h2>
          <h3>Budget Summary</h3>

{budgets.map((budget) => (
  <p key={budget.id}>
    {budget.category} :
    <b> {formatCurrency(budget.totalCost, budget.currency)}</b>
  </p>
))}

<p>
  <b>Grand Total : {formatCurrency(totalBudget)}</b>
</p>


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
      
      {activeTab === "budget" && (
  <>
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

    <th onClick={() => handleSort("totalCost")}>
      Total Cost{getSortIndicator("totalCost")}
    </th>

    <th onClick={() => handleSort("costPerUnit")}>
  Cost / Unit{getSortIndicator("costPerUnit")}
</th>

<th onClick={() => handleSort("units")}>
   Units{getSortIndicator("units")}
</th>

<th onClick={() => handleSort("unitType")}>
  Unit{getSortIndicator("unitType")}
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

    <th>Version</th>
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

<td>
  {formatCurrency(
    budget.totalCost,
    budget.currency
  )}
</td>

<td>
  {formatCurrency(
    budget.costPerUnit,
    budget.currency
  )}
</td>

<td>{budget.units}</td>

<td>{budget.unitType}</td>
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
    className="financial-action-btn"
    onClick={() => handleBudgetPreview(budget)}
  >
    Preview
  </button>

  <button
  type="button"
  className="financial-delete-btn"
  onClick={() => openDeleteModal("budget", budget.id)}
>
  Delete
</button>
</td>



<td>{budget.version}</td>
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
      </>
      )}
      {activeTab==="grants" && (
<section className="payment-table">

<h3>Investigator Grants</h3>

<table>

<thead>
<tr>
<th>Investigator</th>
<th>Grant Type</th>
<th>Amount</th>
<th>Status</th>
</tr>
</thead>

<tbody>

<tr>
<td>Dr. John</td>
<td>Research Grant</td>
<td>{formatCurrency(50000)}</td>
<td>Approved</td>
</tr>

</tbody>

</table>



</section>
)}
        {activeTab==="site" && (
<section className="payment-table">

  <h3>Site Management</h3>

  <table>
    <thead>
      <tr>
        <th>Site</th>
        <th>Budget</th>
        <th>Spent</th>
        <th>Remaining</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>Apollo Hospital</td>
        <td>$250000</td>
        <td>$120000</td>
        <td>$130000</td>
        <td>Healthy</td>
      </tr>
    </tbody>
  </table>

</section>
)}
{activeTab === "subjects" && (
  <section className="payment-table">

    <h3>Subject Costs</h3>

    <table>
      <thead>
        <tr>
          <th>Subject</th>
          <th>Visit</th>
          <th>Procedure</th>
          <th>Cost</th>
          <th>Quantity</th>
          <th>Total Cost</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {subjectCosts.map((item) => (
          <tr key={item.id}>
            <td>{item.subject}</td>
            <td>{item.visit}</td>
            <td>{item.procedure}</td>

            <td>{formatCurrency(item.cost)}</td>

            <td>{item.quantity}</td>

            <td>
              {formatCurrency(item.cost * item.quantity)}
            </td>

            <td>{item.status}</td>
            <td>
  <button
    className="financial-action-btn"
    onClick={() => handleEditSubjectCost(item)}
  >
    Edit
  </button>

  <button
    className="financial-delete-btn"
    onClick={() => handleDeleteSubjectCost(item.id)}
  >
    Delete
  </button>
</td>
          </tr>
        ))}
      </tbody>
    </table>
<div className="financial-summary-card">
  <h3>
    Grand Total: {formatCurrency(grandTotal)}
  </h3>
</div>
  </section>
)}
{activeTab==="summary" && (
<section className="financial-summary">

  <h3>Financial Summary</h3>

  <p>
    Grand Total :
    <b>{formatCurrency(totalBudget)}</b>
  </p>

  <p>
    Payments :
    <b>{formatCurrency(totalPayments)}</b>
  </p>

  <p>
    Receivables :
    <b>
      {formatCurrency(
        receivableList.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        )
      )}
    </b>
  </p>

  <p>
    Invoices :
    <b>{invoiceList.length}</b>
  </p>

  <p>
    Net Budget Cost :
<b>{formatCurrency(netBudgetCost)}</b>
  </p>

</section>
)}
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
                  <td>{formatCurrency(
  payment.amount,
  budgets[0]?.currency
)}</td>
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
                  <td>{formatCurrency(
  receivable.amount,
  budgets[0]?.currency
)}</td>
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
                <td colSpan="11">No invoices found.</td>
              </tr>
            ) : (
              filteredInvoiceList.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNo}</td>
                  <td>{invoice.payer}</td>
                  <td>{formatCurrency(
  invoice.amount,
  budgets[0]?.currency
)}</td>
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
              <select
  value={budgetForm.category}
  onChange={(event) =>
    updateBudgetField(
      "category",
      event.target.value
    )
  }
>
  <option value="">Select Category</option>
  <option value="Clinical Operations">Clinical Operations</option>
  <option value="Site Management">Site Management</option>
  <option value="Patient Recruitment">Patient Recruitment</option>
  <option value="Laboratory">Laboratory</option>
  <option value="Regulatory">Regulatory</option>
  <option value="Pharmacy">Pharmacy</option>
  <option value="Monitoring">Monitoring</option>
  <option value="Data Management">Data Management</option>
</select>

             <label className="financial-form-label">Cost Per Unit</label>

<input
  type="number"
  min="0"
  value={budgetForm.costPerUnit}
  onChange={(event) =>
    setBudgetForm((currentForm) => ({
      ...currentForm,
      costPerUnit: event.target.value,
      totalCost:
        Number(event.target.value || 0) *
        Number(currentForm.units || 0),
    }))
  }
/>

<label className="financial-form-label">Units</label>

<input
  type="number"
  min="1"
  value={budgetForm.units}
  onChange={(event) =>
    setBudgetForm((currentForm) => ({
      ...currentForm,
      units: event.target.value,
      totalCost:
        Number(currentForm.costPerUnit || 0) *
        Number(event.target.value || 0),
    }))
  }
/>

<label className="financial-form-label">Unit Type</label>

<select
  value={budgetForm.unitType}
  onChange={(event) =>
    setBudgetForm((currentForm) => ({
      ...currentForm,
      unitType: event.target.value,
    }))
  }
>
  <option value="Subjects">Subjects</option>
  <option value="Visits">Visits</option>
  <option value="Sites">Sites</option>
  <option value="Months">Months</option>
</select>

<label className="financial-form-label">
Total Cost
</label>

<input
   type="number"
   value={budgetForm.totalCost}
   readOnly
/>
<label className="financial-form-label">
Currency
</label>

<select
   value={budgetForm.currency}
   onChange={(event)=>
      updateBudgetField(
         "currency",
         event.target.value
      )
   }
>

<option>USD</option>

<option>INR</option>

<option>EUR</option>

</select>

<label className="financial-form-label">
Version
</label>

<input
   type="text"
   value={budgetForm.version}
   readOnly
/>
              <label className="financial-form-label">Start Date</label>
             <input
   type="date"
   value={budgetForm.startDate}
   onChange={(event)=>
      updateBudgetField(
         "startDate",
         event.target.value
      )
   }
/>

              <label className="financial-form-label">End Date</label>
              <input
   type="date"
   value={budgetForm.endDate}
   onChange={(event)=>
      updateBudgetField(
         "endDate",
         event.target.value
      )
   }
/>

              <label className="financial-form-label">Budget Status</label>
              <select
   value={budgetForm.status}
   onChange={(event)=>
      updateBudgetField(
         "status",
         event.target.value
      )
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
   onChange={(event)=>
      updateBudgetField(
         "description",
         event.target.value
      )
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

      {showSubjectCostModal && (
  <div className="financial-modal-overlay">
    <div className="financial-modal">

      <h2>New Subject Cost</h2>

      <div className="financial-form">

        <label>Subject ID</label>
        <input
          type="text"
          value={subjectCostForm.subjectId}
          onChange={(e)=>
            setSubjectCostForm({
              ...subjectCostForm,
              subjectId:e.target.value
            })
          }
        />

        <label>Visit</label>
        <input
          type="text"
          value={subjectCostForm.visit}
          onChange={(e)=>
            setSubjectCostForm({
              ...subjectCostForm,
              visit:e.target.value
            })
          }
        />

        <label>Procedure</label>
        <input
          type="text"
          value={subjectCostForm.procedure}
          onChange={(e)=>
            setSubjectCostForm({
              ...subjectCostForm,
              procedure:e.target.value
            })
          }
        />

        <label>Cost</label>
        <input
          type="number"
          value={subjectCostForm.cost}
          onChange={(e)=>
            setSubjectCostForm({
              ...subjectCostForm,
              cost:e.target.value
            })
          }
        />

        <label>Quantity</label>
        <input
          type="number"
          value={subjectCostForm.quantity}
          onChange={(e)=>
            setSubjectCostForm({
              ...subjectCostForm,
              quantity:e.target.value
            })
          }
        />

        <label>Total</label>

<input
  readOnly
  value={
    Number(subjectCostForm.cost || 0) *
    Number(subjectCostForm.quantity || 0)
  }
/>

        <label>Status</label>
        <select
          value={subjectCostForm.status}
          onChange={(e)=>
            setSubjectCostForm({
              ...subjectCostForm,
              status:e.target.value
            })
          }
        >
          <option>Pending</option>
          <option>Completed</option>
        </select>

      </div>

      <div className="financial-modal-actions">

        <button
          onClick={resetSubjectCostModal}
        >
          Cancel
        </button>

       <button
  onClick={handleSaveSubjectCost}
>
  Save
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
      
      {showBudgetPreview && selectedBudget && (
  <div className="financial-modal-overlay">
    <div className="financial-modal">
      <h2>Budget Preview</h2>

      <p><b>Budget Name:</b> {selectedBudget.name}</p>
      <p><b>Version:</b> {selectedBudget.version}</p>
      <p><b>Status:</b> {selectedBudget.status}</p>
      <p><b>Study Name:</b> {selectedBudget.studyName}</p>
      <p><b>Category:</b> {selectedBudget.category}</p>

<p><b>Cost Per Unit:</b> {formatCurrency(selectedBudget.costPerUnit)}</p>

<p><b>Units:</b> {selectedBudget.units}</p>

<p><b>Total Cost:</b> {formatCurrency(selectedBudget.totalCost)}</p>

<p><b>Currency:</b> {selectedBudget.currency}</p>

<p><b>Start Date:</b> {selectedBudget.startDate}</p>

<p><b>End Date:</b> {selectedBudget.endDate}</p>

<p><b>Description:</b> {selectedBudget.description}</p>

      <div className="financial-modal-actions">
        <button
          type="button"
          onClick={() => setShowBudgetPreview(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
}

export default StudyFinancials;