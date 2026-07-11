import DOCUMENT_STATUS from "../Constants/documentStatus";

/**
 * Calculate completion percentage.
 */
export const calculateCompletionPercentage = (
  approved = 0,
  total = 0
) => {
  if (!total) return 0;

  return Math.round((approved / total) * 100);
};

/**
 * Returns dashboard summary.
 */
export const getDashboardSummary = (documents = []) => {
  const today = new Date();

  const approvedDocuments = documents.filter(
    (doc) => doc.status === DOCUMENT_STATUS.APPROVED
  );

  const pendingDocuments = documents.filter((doc) =>
    [
      DOCUMENT_STATUS.PENDING,
      DOCUMENT_STATUS.UNDER_REVIEW,
      DOCUMENT_STATUS.UNDER_APPROVAL,
    ].includes(doc.status)
  );

  const expiredDocuments = documents.filter((doc) => {
    if (!doc.expiryDate) return false;

    return new Date(doc.expiryDate) < today;
  });

  const missingDocuments = documents.filter(
    (doc) => doc.status === DOCUMENT_STATUS.MISSING
  );

  const expiringSoonDocuments = getExpiringSoonDocuments(documents);

  return {
    totalDocuments: documents.length,

    approvedDocuments: approvedDocuments.length,

    pendingDocuments: pendingDocuments.length,

    expiredDocuments: expiredDocuments.length,

    missingDocuments: missingDocuments.length,

    expiringSoonDocuments: expiringSoonDocuments.length,

    completionPercentage: calculateCompletionPercentage(
      approvedDocuments.length,
      documents.length
    ),
  };
};

/**
 * Documents expiring within given days.
 */
export const getExpiringSoonDocuments = (
  documents = [],
  days = 30
) => {
  const today = new Date();

  const target = new Date();

  target.setDate(today.getDate() + days);

  return documents.filter((doc) => {
    if (!doc.expiryDate) return false;

    const expiry = new Date(doc.expiryDate);

    return expiry >= today && expiry <= target;
  });
};

/**
 * Generic dashboard cards.
 */
export const buildDashboardCards = (
  summary = {},
  cardConfig = [
    {
      key: "totalDocuments",
      title: "Total Documents",
    },
    {
      key: "approvedDocuments",
      title: "Approved",
    },
    {
      key: "pendingDocuments",
      title: "Pending",
    },
    {
      key: "expiredDocuments",
      title: "Expired",
    },
    {
      key: "missingDocuments",
      title: "Missing",
    },
    {
      key: "completionPercentage",
      title: "Completion",
      suffix: "%",
    },
  ]
) => {
  return cardConfig.map((card) => ({
    ...card,
    value: summary[card.key] ?? 0,
  }));
};

/**
 * Returns dashboard metric.
 */
export const getDashboardMetric = (
  summary = {},
  metric
) => {
  return summary[metric] ?? 0;
};

/**
 * Returns whether dashboard has data.
 */
export const hasDashboardData = (documents = []) =>
  documents.length > 0;

/**
 * Returns empty dashboard summary.
 */
export const getEmptyDashboardSummary = () => ({
  totalDocuments: 0,
  approvedDocuments: 0,
  pendingDocuments: 0,
  expiredDocuments: 0,
  missingDocuments: 0,
  expiringSoonDocuments: 0,
  completionPercentage: 0,
});