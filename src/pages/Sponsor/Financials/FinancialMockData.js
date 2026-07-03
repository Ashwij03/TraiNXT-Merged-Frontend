export const budgetSummary = {
  totalBudget: 2500000,
  utilized: 1450000,
  remaining: 1050000,
  budgetStatus: "Active",
};

export const payments = [
  {
    id: 1,
    milestone: "Site Initiation",
    amount: 350000,
    paidOn: "10-May-2026",
    status: "Paid",
  },
  {
    id: 2,
    milestone: "Patient Enrollment",
    amount: 500000,
    paidOn: "Pending",
    status: "Pending",
  },
  {
    id: 3,
    milestone: "Database Lock",
    amount: 600000,
    paidOn: "-",
    status: "Upcoming",
  },
];
export const receivables = [

{
    id:1,
    payer:"ABC Pharma",
    amount:450000,
    dueDate:"2026-07-15",
    status:"Pending"
},

{
    id:2,
    payer:"XYZ CRO",
    amount:700000,
    dueDate:"2026-08-01",
    status:"Received"
},

{
    id:3,
    payer:"Nova Labs",
    amount:350000,
    dueDate:"2026-08-20",
    status:"Overdue"
}

];
export const invoiceData = [
{
    id:1,
    invoiceNo:"INV-1001",
    payer:"ABC Pharma",
    amount:450000,
    issueDate:"2026-07-01",
    dueDate:"2026-07-15",
    status:"Pending"
},
{
    id:2,
    invoiceNo:"INV-1002",
    payer:"XYZ CRO",
    amount:700000,
    issueDate:"2026-07-10",
    dueDate:"2026-08-01",
    status:"Paid"
},
{
    id:3,
    invoiceNo:"INV-1003",
    payer:"Nova Labs",
    amount:350000,
    issueDate:"2026-07-20",
    dueDate:"2026-08-20",
    status:"Overdue"
}
];