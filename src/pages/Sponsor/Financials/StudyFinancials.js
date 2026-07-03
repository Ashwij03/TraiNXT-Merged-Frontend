import React, { useState } from "react";
import "./StudyFinancials.css";
import {
    payments,
    receivables,
    invoiceData
} from "./FinancialMockData";

function StudyFinancials() {
const [selectedFilter, setSelectedFilter] = useState("All");
const [showAllData, setShowAllData] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [showBudgetModal, setShowBudgetModal] = useState(false);
const [currentPage, setCurrentPage] = useState(1);

const rowsPerPage = 5;

const [budgets, setBudgets] = useState([
  {
    id: 1,
    name: "Initial Study Budget",
    category: "Clinical Operations",
    amount: 2500000,
    startDate: "2026-07-01",
    endDate: "2027-06-30",
    status: "Active",
    description: "Initial approved study budget"
  }
]);

const [budgetForm, setBudgetForm] = useState({
  name: "",
  category: "",
  amount: "",
  startDate: "",
  endDate: "",
  status: "Active",
  description: ""
});
const [editBudgetId, setEditBudgetId] = useState(null);

const [isEditingBudget, setIsEditingBudget] = useState(false);

const [showReceivableModal, setShowReceivableModal] = useState(false);
const [showInvoiceModal, setShowInvoiceModal] = useState(false);

const [isEditingInvoice, setIsEditingInvoice] = useState(false);

const [invoiceForm, setInvoiceForm] = useState({
    invoiceNo: "",
    payer: "",
    amount: "",
    issueDate: "",
    dueDate: "",
    status: "Pending"
});

const [receivableForm, setReceivableForm] = useState({
    payer: "",
    amount: "",
    dueDate: "",
    status: "Pending"
});

const [showDeleteModal, setShowDeleteModal] = useState(false);

const [deleteReason, setDeleteReason] = useState("");

const [deleteType, setDeleteType] = useState("");

const [deleteId, setDeleteId] = useState(null);

const [editReceivableId, setEditReceivableId] = useState(null);

const [isEditingReceivable, setIsEditingReceivable] = useState(false);

const [showPaymentModal, setShowPaymentModal] = useState(false);

const [paymentList, setPaymentList] = useState(payments);

const [receivableList, setReceivableList] = useState(receivables);

const [invoiceList, setInvoiceList] = useState(invoiceData);

const [paymentForm, setPaymentForm] = useState({
  milestone: "",
  amount: "",
  paidOn: "",
  status: "Pending",
  notes: ""
});

const [editPaymentId, setEditPaymentId] = useState(null);

const [isEditingPayment, setIsEditingPayment] = useState(false);

const [sortField, setSortField] = useState("");
const [sortDirection, setSortDirection] = useState("asc");

const filteredPaymentList =
paymentList
.filter((payment)=>{

const matchesSearch =

payment.milestone
.toLowerCase()
.includes(searchTerm.toLowerCase());

const matchesStatus =

selectedFilter==="All"

||

payment.status===selectedFilter;

return matchesSearch && matchesStatus;

});
const filteredReceivableList =
  receivableList.filter((receivable) => {

    const matchesSearch =
      receivable.payer
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;

  });

  
const handleEditBudget = (budget) => {

    setBudgetForm({
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        startDate: budget.startDate,
        endDate: budget.endDate,
        status: budget.status,
        description: budget.description
    });

    setEditBudgetId(budget.id);

    setIsEditingBudget(true);

    setShowBudgetModal(true);

};
const handleSaveBudget = () => {

  if (
    !budgetForm.name ||
    !budgetForm.category ||
    !budgetForm.amount ||
    !budgetForm.startDate ||
    !budgetForm.endDate
  ) {
    alert("Please fill all required fields.");
    return;
  }

  // EDIT EXISTING BUDGET
  if (isEditingBudget) {

    const updatedBudgets = budgets.map((budget) =>
      budget.id === editBudgetId
        ? {
            ...budget,
            ...budgetForm,
            amount: Number(budgetForm.amount)
          }
        : budget
    );

    setBudgets(updatedBudgets);

    setShowBudgetModal(false);
    setIsEditingBudget(false);
    setEditBudgetId(null);

    setBudgetForm({
      name: "",
      category: "",
      amount: "",
      startDate: "",
      endDate: "",
      status: "Active",
      description: ""
    });

    return;
  }

  // CREATE NEW BUDGET
  const newBudget = {
    id: Date.now(),
    ...budgetForm,
    amount: Number(budgetForm.amount)
  };

  setBudgets([...budgets, newBudget]);

  setShowBudgetModal(false);

  setBudgetForm({
    name: "",
    category: "",
    amount: "",
    startDate: "",
    endDate: "",
    status: "Active",
    description: ""
  });

};

const handleSavePayment = () => {

  if (
    !paymentForm.milestone ||
    !paymentForm.amount ||
    !paymentForm.paidOn
  ) {
    alert("Please fill all required fields.");
    return;
  }
  if (isEditingPayment) {

  const updatedPayments = paymentList.map((payment) =>

    payment.id === editPaymentId

      ? {
          ...payment,
          milestone: paymentForm.milestone,
          amount: Number(paymentForm.amount),
          paidOn: paymentForm.paidOn,
          status: paymentForm.status,
          notes: paymentForm.notes
        }

      : payment

  );

  setPaymentList(updatedPayments);

  setShowPaymentModal(false);

  setIsEditingPayment(false);

  setEditPaymentId(null);

  setPaymentForm({
    milestone: "",
    amount: "",
    paidOn: "",
    status: "Pending",
    notes: ""
  });

  return;
}

  const newPayment = {
    id: Date.now(),
    milestone: paymentForm.milestone,
    amount: Number(paymentForm.amount),
    paidOn: paymentForm.paidOn,
    status: paymentForm.status,
    notes: paymentForm.notes
  };

  setPaymentList([...paymentList, newPayment]);

  setShowPaymentModal(false);

  setPaymentForm({
    milestone: "",
    amount: "",
    paidOn: "",
    status: "Pending",
    notes: ""
  });

};
const handleEditPayment = (payment) => {

  setPaymentForm({
    milestone: payment.milestone,
    amount: payment.amount,
    paidOn: payment.paidOn,
    status: payment.status,
    notes: payment.notes || ""
  });

  setEditPaymentId(payment.id);

  setIsEditingPayment(true);

  setShowPaymentModal(true);

};

const handleSaveReceivable = () => {

    if (
        !receivableForm.payer ||
        !receivableForm.amount ||
        !receivableForm.dueDate
    ) {
        alert("Please fill all required fields.");
        return;
    }

    if (isEditingReceivable) {

        const updatedReceivables = receivableList.map((item) =>
            item.id === editReceivableId
                ? {
                      ...item,
                      ...receivableForm,
                      amount: Number(receivableForm.amount)
                  }
                : item
        );

        setReceivableList(updatedReceivables);

    } else {

        const newReceivable = {
            id: Date.now(),
            ...receivableForm,
            amount: Number(receivableForm.amount)
        };

        setReceivableList([
            ...receivableList,
            newReceivable
        ]);

    }

    setShowReceivableModal(false);

    setIsEditingReceivable(false);

    setEditReceivableId(null);

    setReceivableForm({
        payer: "",
        amount: "",
        dueDate: "",
        status: "Pending"
    });

};

const handleSaveInvoice = () => {

    if (isEditingInvoice) {

        setInvoiceList(
            invoiceList.map((invoice) =>
                invoice.id === invoiceForm.id
                    ? invoiceForm
                    : invoice
            )
        );

    } else {

        setInvoiceList([
            ...invoiceList,
            {
                ...invoiceForm,
                id: Date.now()
            }
        ]);

    }

    setShowInvoiceModal(false);

    setIsEditingInvoice(false);

setInvoiceForm({
    invoiceNo: "",
    payer: "",
    amount: "",
    issueDate: "",
    dueDate: "",
    status: "Pending"
});

    setInvoiceForm({
        invoiceNo: "",
        payer: "",
        amount: "",
        issueDate: "",
        dueDate: "",
        status: "Pending"
    });

};
const handleEditInvoice = (invoice) => {

    setInvoiceForm(invoice);

    setIsEditingInvoice(true);

    setShowInvoiceModal(true);

};

const handleEditReceivable = (receivable) => {

    setReceivableForm({
        payer: receivable.payer,
        amount: receivable.amount,
        dueDate: receivable.dueDate,
        status: receivable.status
    });

    setEditReceivableId(receivable.id);

    setIsEditingReceivable(true);

    setShowReceivableModal(true);

};

const filteredBudgets = budgets.filter((budget)=>

budget.name
.toLowerCase()
.includes(searchTerm.toLowerCase())

||

budget.category
.toLowerCase()
.includes(searchTerm.toLowerCase())

);

const sortedBudgets = [...filteredBudgets].sort((a, b) => {

    if (!sortField) return 0;

    if (a[sortField] < b[sortField])
        return sortDirection === "asc" ? -1 : 1;

    if (a[sortField] > b[sortField])
        return sortDirection === "asc" ? 1 : -1;

    return 0;

});

const totalPages = Math.ceil(sortedBudgets.length / rowsPerPage);

const lastIndex = currentPage * rowsPerPage;

const firstIndex = lastIndex - rowsPerPage;

const currentBudgets = sortedBudgets.slice(
    firstIndex,
    lastIndex
);

const totalBudget = budgets.reduce(
  (sum, item) => sum + item.amount,
  0
);

const totalPayments = paymentList.reduce(
  (sum, item) => sum + item.amount,
  0
);

const remainingBudget = totalBudget - totalPayments;

const exportToCSV = () => {

    let csv = "Budget Name,Category,Amount,Status,Start Date,End Date\n";

      filteredBudgets.forEach((budget) => {

        csv += `${budget.name},${budget.category},${budget.amount},${budget.status},${budget.startDate},${budget.endDate}\n`;

    });

    csv += "\n";

    csv += "Milestone,Amount,Paid On,Status\n";

     filteredPaymentList.forEach((payment) => {

        csv += `${payment.milestone},${payment.amount},${payment.paidOn},${payment.status}\n`;

    });

    const blob = new Blob([csv], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "StudyFinancials.csv";

    link.click();

};
const handleSort = (field) => {

    if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
        setSortField(field);
        setSortDirection("asc");
    }

};

const confirmDelete = () => {

    if (!deleteReason.trim()) {
        alert("Please enter the reason for deletion.");
        return;
    }

    if (deleteType === "budget") {
        setBudgets(
            budgets.filter(item => item.id !== deleteId)
        );
    }

    if (deleteType === "payment") {
        setPaymentList(
            paymentList.filter(item => item.id !== deleteId)
        );
    }

    if (deleteType === "receivable") {
        setReceivableList(
            receivableList.filter(item => item.id !== deleteId)
        );
    }

    if (deleteType === "invoice") {
        setInvoiceList(
            invoiceList.filter(item => item.id !== deleteId)
        );
    }

    setDeleteReason("");
    setDeleteId(null);
    setDeleteType("");
    setShowDeleteModal(false);
};
    return (

        <div className="financial-page">

            <div className="financial-header">

    <div>

        <h2>Study Financials</h2>

        <p>Manage Study Budgets and Payments</p>
        <input
    type="text"
    placeholder="Search Budget or Payment..."
    value={searchTerm}
    onChange={(e)=>{
    setSearchTerm(e.target.value);
    setCurrentPage(1);
}}
    className="financial-search"
/>
    </div>

    <div className="financial-filter">

        <select
            value={selectedFilter}
            onChange={(e)=>setSelectedFilter(e.target.value)}
        >

            <option>All</option>

            <option>Paid</option>

            <option>Pending</option>

            <option>Upcoming</option>

        </select>

    </div>

</div>

            <div className="financial-cards">

                <div className="financial-card">
                    <h4>Total Budget</h4>
                    <h2>${totalBudget.toLocaleString()}</h2>
                </div>

                <div className="financial-card">
                    <h4>Budget Utilized</h4>
                  <h2>
                   $
                 {totalBudget.toLocaleString()}
                   </h2>
                </div>

                <div className="financial-card">
                    <h4>Remaining Budget</h4>
                    <h2>${remainingBudget.toLocaleString()}</h2>
                </div>

                <div className="financial-card">
                    <h4>Budget Status</h4>
                 <span className="status active">
                 {remainingBudget > 0 ? "Healthy" : "Exceeded"}
                 </span>

                  <p style={{marginTop:"10px"}}>

                   Budgets Created : {budgets.length}

                   </p>
                </div>

            </div>

            <div className="financial-actions">

       <button
  onClick={() => setShowBudgetModal(true)}
>
  + New Budget
</button>

<button
onClick={() => {
    setShowPaymentModal(true);
    setIsEditingPayment(false);

    setPaymentForm({
        milestone: "",
        amount: "",
        paidOn: "",
        status: "Pending",
        notes: ""
    });
}}
>

+ New Payment

</button>

    <button
onClick={()=>{
    setShowReceivableModal(true);

    setIsEditingReceivable(false);

    setReceivableForm({
        payer:"",
        amount:"",
        dueDate:"",
        status:"Pending"
    });
}}
>
    + New Receivable
</button>
<button
    onClick={() => {
        setShowInvoiceModal(true);
        setIsEditingInvoice(false);

        setInvoiceForm({
            invoiceNo: "",
            payer: "",
            amount: "",
            issueDate: "",
            dueDate: "",
            status: "Pending"
        });
    }}
>
    + New Invoice
</button>

<button
onClick={()=>setShowAllData(!showAllData)}
>
    {showAllData ? "Hide" : "View All"}
</button>

<button onClick={exportToCSV}>
    Export CSV
</button>

</div>

{showAllData && (

<div className="financial-summary">

<h2>Financial Summary</h2>

<div className="summary-card">

<p>
Total Budgets : <b>{budgets.length}</b>
</p>

<p>
Total Payments : <b>{paymentList.length}</b>
</p>

<p>
Budget Utilized :
<b>
$
{budgets
.reduce((sum,item)=>sum+item.amount,0)
.toLocaleString()}
</b>
</p>

<p>
Payments Recorded :
<b>
$
{paymentList
.reduce((sum,item)=>sum+item.amount,0)
.toLocaleString()}
</b>
</p>

</div>

</div>

)}


            <div className="budget-list">

             <h3>Study Budgets</h3>

            </div>

            <div className="budget-table">

<table>

<thead>

<tr>

<th onClick={() => handleSort("name")}>
    Budget Name
</th>

<th onClick={() => handleSort("category")}>
    Category
</th>

<th onClick={() => handleSort("amount")}>
    Amount
</th>

<th onClick={() => handleSort("status")}>
    Status
</th>

<th onClick={() => handleSort("startDate")}>
    Start Date
</th>

<th onClick={() => handleSort("endDate")}>
    End Date
</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

{

currentBudgets.map((budget) => (

<tr key={budget.id}>

<td>{budget.name}</td>

<td>{budget.category}</td>

<td>

${budget.amount.toLocaleString()}

</td>

<td>

<span className="status active">

{budget.status}

</span>

</td>

<td>

{budget.startDate}

</td>

<td>

{budget.endDate}

</td>

<td>

<button
onClick={()=>handleEditBudget(budget)}
>

Edit

</button>

<button
  onClick={() => {
    setDeleteType("budget");
    setDeleteId(budget.id);
    setDeleteReason("");
    setShowDeleteModal(true);
  }}
>
  Delete
</button>

</td>

</tr>

))

}

</tbody>

</table>

</div>
<div className="pagination">

<button
disabled={currentPage===1}
onClick={()=>
setCurrentPage(currentPage-1)
}
>
Previous
</button>

<span>

Page {currentPage} of {totalPages}

</span>

<button
disabled={currentPage===totalPages}
onClick={()=>
setCurrentPage(currentPage+1)
}
>
Next
</button>

</div>

            <div className="payment-table">

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

{
filteredPaymentList.length===0 ?


<tr>

<td colSpan="4">

No Payments Found

</td>

</tr>

:

filteredPaymentList.map((payment)=>(

<tr key={payment.id}>

<td>{payment.milestone}</td>

<td>

${payment.amount.toLocaleString()}

</td>

<td>{payment.paidOn}</td>

<td>

<span className={`status ${payment.status.toLowerCase()}`}>

{payment.status}

</span>

</td>
<td>

<button
className="action-btn edit-btn"
onClick={() => handleEditPayment(payment)}
>
Edit
</button>

<button
className="action-btn delete-btn"
onClick={() => {
    setDeleteType("payment");
    setDeleteId(payment.id);
    setDeleteReason("");
    setShowDeleteModal(true);
}}
>
Delete
</button>

</td>

</tr>

))

}

</tbody>

</table>

</div>
<div className="receivable-table">

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

        {
            filteredReceivableList.map((receivable) => (

                <tr key={receivable.id}>

                    <td>{receivable.payer}</td>

                    <td>
                        ${receivable.amount.toLocaleString()}
                    </td>

                    <td>{receivable.dueDate}</td>

                    <td>

                        <span className={`status ${receivable.status.toLowerCase()}`}>

                            {receivable.status}

                        </span>

                    </td>

          <td>
    <div className="receivable-action-buttons">

        <button
            className="receivable-edit-btn"
            onClick={() => handleEditReceivable(receivable)}
        >
            Edit
        </button>

             <button
             className="receivable-delete-btn"
             onClick={() => {
             setDeleteType("receivable");
             setDeleteId(receivable.id);
             setDeleteReason("");
             setShowDeleteModal(true);
           }}
>
Delete
</button>

    </div>
</td>

                </tr>

            ))
        }

        </tbody>

    </table>

</div>
<div className="invoice-table">

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

        {

        invoiceList.map((invoice)=>(

        <tr key={invoice.id}>

            <td>{invoice.invoiceNo}</td>

            <td>{invoice.payer}</td>

            <td>${invoice.amount.toLocaleString()}</td>

            <td>{invoice.issueDate}</td>

            <td>{invoice.dueDate}</td>

            <td>

                <span className={`status ${invoice.status.toLowerCase()}`}>

                    {invoice.status}

                </span>

            </td>

            <td>

               <button
    className="receivable-edit-btn"
    onClick={() => handleEditInvoice(invoice)}
>
    Edit
</button>    

<button
className="receivable-delete-btn"
onClick={() => {
    setDeleteType("invoice");
    setDeleteId(invoice.id);
    setDeleteReason("");
    setShowDeleteModal(true);
}}
>
Delete
</button>

            </td>

        </tr>

        ))

        }

        </tbody>

    </table>

</div>


{showBudgetModal && (

<div className="financial-modal-overlay">

<div className="financial-modal">

<h2>

{

isEditingBudget

?

"Edit Study Budget"

:

"New Study Budget"

}

</h2>

<div className="financial-form">

<label className="form-label">
    Budget Name
</label>

<input
    type="text"
    value={budgetForm.name}
    onChange={(e) =>
        setBudgetForm({
            ...budgetForm,
            name: e.target.value
        })
    }
/>

<label className="form-label">
    Budget Category
</label>

<input
    value={budgetForm.category}
    onChange={(e)=>
        setBudgetForm({
            ...budgetForm,
            category:e.target.value
        })
    }
/>

<label className="form-label">
    Budget Amount
</label>

<input
    type="number"
    value={budgetForm.amount}
    onChange={(e) =>
        setBudgetForm({
            ...budgetForm,
            amount: e.target.value
        })
    }
/>

<label className="form-label">
    Start Date
</label>

<input
    type="date"
    value={budgetForm.startDate}
    onChange={(e) =>
        setBudgetForm({
            ...budgetForm,
            startDate: e.target.value
        })
    }
/>

<label className="form-label">
    End Date
</label>

<input
    type="date"
    value={budgetForm.endDate}
    onChange={(e) =>
        setBudgetForm({
            ...budgetForm,
            endDate: e.target.value
        })
    }
/>

<label className="form-label">
    Budget Status
</label>

<select
    value={budgetForm.status}
    onChange={(e) =>
        setBudgetForm({
            ...budgetForm,
            status: e.target.value
        })
    }
>
    <option value="Active">Active</option>
    <option value="Draft">Draft</option>
    <option value="Closed">Closed</option>
</select>

<label className="form-label">
    Budget Description
</label>

<textarea
    rows="4"
    value={budgetForm.description}
    onChange={(e) =>
        setBudgetForm({
            ...budgetForm,
            description: e.target.value
        })
    }
/>

</div>

<div className="financial-modal-actions">

<button
onClick={()=>setShowBudgetModal(false)}
>

Cancel

</button>

<button
    onClick={handleSaveBudget}
>
    {isEditingBudget ? "Update Budget" : "Save Budget"}
</button>

</div>

</div>

</div>

)}

{/* PAYMENT MODAL */}

{showPaymentModal && (

<div className="modal-overlay">

<div className="modal-content">

<h2>
{isEditingPayment ? "Edit Payment" : "New Payment"}
</h2>

<label className="form-label">Milestone</label>

<input
type="text"
value={paymentForm.milestone}
onChange={(e)=>
setPaymentForm({
...paymentForm,
milestone:e.target.value
})
}
/>

<label className="form-label">Amount</label>

<input
type="number"
value={paymentForm.amount}
onChange={(e)=>
setPaymentForm({
...paymentForm,
amount:e.target.value
})
}
/>

<label className="form-label">Payment Date</label>

<input
type="date"
value={paymentForm.paidOn}
onChange={(e)=>
setPaymentForm({
...paymentForm,
paidOn:e.target.value
})
}
/>

<label className="form-label">Payment Status</label>

<select
value={paymentForm.status}
onChange={(e)=>
setPaymentForm({
...paymentForm,
status:e.target.value
})
}
>
<option>Paid</option>
<option>Pending</option>
<option>Upcoming</option>
</select>

<label className="form-label">Notes</label>

<textarea
rows="4"
value={paymentForm.notes}
onChange={(e)=>
setPaymentForm({
...paymentForm,
notes:e.target.value
})
}
/>

<div className="modal-actions">

<button
onClick={()=>setShowPaymentModal(false)}
>
Cancel
</button>

<button
onClick={handleSavePayment}
>
{isEditingPayment ? "Update Payment" : "Save Payment"}
</button>

</div>

</div>

</div>

)}

{showReceivableModal && (

<div className="financial-modal-overlay">

<div className="modal-content">

<h2>

{isEditingReceivable ? "Edit Receivable" : "New Receivable"}

</h2>

<div className="modal-form">

<div>

<label className="form-label">
    Payer
</label>

<input
    type="text"
    value={receivableForm.payer}
    onChange={(e)=>
        setReceivableForm({
            ...receivableForm,
            payer:e.target.value
        })
    }
/>

<label className="form-label">
    Amount
</label>

<input
    type="number"
    value={receivableForm.amount}
    onChange={(e)=>
        setReceivableForm({
            ...receivableForm,
            amount:e.target.value
        })
    }
/>

<label className="form-label">
    Due Date
</label>

<input
    type="date"
    value={receivableForm.dueDate}
    onChange={(e)=>
        setReceivableForm({
            ...receivableForm,
            dueDate:e.target.value
        })
    }
/>

<label className="form-label">
    Receivable Status
</label>

<select
    value={receivableForm.status}
    onChange={(e)=>
        setReceivableForm({
            ...receivableForm,
            status:e.target.value
        })
    }
>
    <option>Pending</option>
    <option>Received</option>
    <option>Overdue</option>
</select>
</div>
</div>

<div className="modal-actions">

<button
onClick={()=>setShowReceivableModal(false)}
>
Cancel
</button>

<button
onClick={handleSaveReceivable}
>
{isEditingReceivable ? "Update Receivable" : "Save Receivable"}
</button>

</div>

</div>

</div>


)}
{showInvoiceModal && (
<div className="modal-overlay">
  <div className="modal-content">

    <h2>
      {isEditingInvoice ? "Edit Invoice" : "New Invoice"}
    </h2>

    <label className="form-label">
    Invoice Number
</label>

<input
    type="text"
    value={invoiceForm.invoiceNo}
    onChange={(e)=>
        setInvoiceForm({
            ...invoiceForm,
            invoiceNo:e.target.value
        })
    }
/>

<label className="form-label">
    Payer
</label>

<input
    type="text"
    value={invoiceForm.payer}
    onChange={(e)=>
        setInvoiceForm({
            ...invoiceForm,
            payer:e.target.value
        })
    }
/>

<label className="form-label">
    Amount
</label>

<input
    type="number"
    value={invoiceForm.amount}
    onChange={(e)=>
        setInvoiceForm({
            ...invoiceForm,
            amount:e.target.value
        })
    }
/>

<label className="form-label">
    Issue Date
</label>

<input
    type="date"
    value={invoiceForm.issueDate}
    onChange={(e)=>
        setInvoiceForm({
            ...invoiceForm,
            issueDate:e.target.value
        })
    }
/>

<label className="form-label">
    Due Date
</label>

<input
    type="date"
    value={invoiceForm.dueDate}
    onChange={(e)=>
        setInvoiceForm({
            ...invoiceForm,
            dueDate:e.target.value
        })
    }
/>

<label className="form-label">
    Invoice Status
</label>

<select
    value={invoiceForm.status}
    onChange={(e)=>
        setInvoiceForm({
            ...invoiceForm,
            status:e.target.value
        })
    }
>
    <option>Pending</option>
    <option>Paid</option>
    <option>Overdue</option>
</select>


    <div className="modal-actions">

      <button
        onClick={() => setShowInvoiceModal(false)}
      >
        Cancel
      </button>

      <button
        onClick={handleSaveInvoice}
      >
        {isEditingInvoice
          ? "Update Invoice"
          : "Save Invoice"}
      </button>

    </div>

  </div>
</div>
)}
{showDeleteModal && (

<div className="modal-overlay">

    <div className="modal-content">

        <h2>Delete Confirmation</h2>

        <p>
            Are you sure you want to delete this {deleteType}?
        </p>

        <label className="form-label">
            Reason for Delete *
        </label>

        <textarea
            rows="4"
            value={deleteReason}
            onChange={(e) =>
                setDeleteReason(e.target.value)
            }
            placeholder="Enter reason..."
        />

        <div className="modal-actions">

            <button
                onClick={() =>
                    setShowDeleteModal(false)
                }
            >
                Cancel
            </button>

            <button
                className="receivable-delete-btn"
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