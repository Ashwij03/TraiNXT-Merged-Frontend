import { getParticipatingSiteDocuments } from "./eisfService";

/**
 * Returns all documents
 */
export function getDocuments() {
  return getParticipatingSiteDocuments();
}

/**
 * Returns documents by section
 */
export function getDocumentsBySection(sectionId) {
  return getParticipatingSiteDocuments().filter(
    (document) => document.sectionId === sectionId
  );
}

/**
 * Returns documents by folder
 */
export function getDocumentsByFolder(folderId) {
  return getParticipatingSiteDocuments().filter(
    (document) => document.folderId === folderId
  );
}

/**
 * Returns document by id
 */
export function getDocumentById(documentId) {
  return getParticipatingSiteDocuments().find(
    (document) => document.id === documentId
  );
}

/**
 * Search by document name
 */
export function searchDocuments(searchText = "") {
  const keyword = searchText.trim().toLowerCase();

  if (!keyword) {
    return getParticipatingSiteDocuments();
  }

  return getParticipatingSiteDocuments().filter((document) =>
    document.name?.toLowerCase().includes(keyword)
  );
}

/**
 * Filter by status
 */
export function getDocumentsByStatus(status) {
  if (!status) return getParticipatingSiteDocuments();

  return getParticipatingSiteDocuments().filter(
    (document) => document.status === status
  );
}

/**
 * Filter by document type
 */
export function getDocumentsByType(type) {
  if (!type) return getParticipatingSiteDocuments();

  return getParticipatingSiteDocuments().filter(
    (document) => document.documentType === type
  );
}

/**
 * Filter using multiple criteria.
 * Keeps backward compatibility while enabling reusable filtering.
 */
export function filterDocuments(filters = {}) {
  const {
    sectionId,
    folderId,
    status,
    documentType,
    searchText,
  } = filters;

  const keyword = searchText?.trim().toLowerCase();

  return getParticipatingSiteDocuments().filter((document) => {
    if (sectionId && document.sectionId !== sectionId) return false;

    if (folderId && document.folderId !== folderId) return false;

    if (status && document.status !== status) return false;

    if (documentType && document.documentType !== documentType) return false;

    if (
      keyword &&
      !(
        document.name?.toLowerCase().includes(keyword) ||
        document.description?.toLowerCase().includes(keyword)
      )
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Generic sorting
 */
export function sortDocuments(documents = [], field = "name", order = "asc") {
  return [...documents].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];

    if (valueA == null) return 1;
    if (valueB == null) return -1;

    if (typeof valueA === "string") {
      return order === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return order === "asc" ? valueA - valueB : valueB - valueA;
  });
}

/**
 * Returns unique document types
 */
export function getAvailableDocumentTypes() {
  return [...new Set(getParticipatingSiteDocuments().map(doc => doc.documentType))]
    .filter(Boolean)
    .sort();
}

/**
 * Returns unique statuses
 */
export function getAvailableStatuses() {
  return [...new Set(getParticipatingSiteDocuments().map(doc => doc.status))]
    .filter(Boolean)
    .sort();
}

/**
 * Returns document statistics
 */
export function getDocumentStatistics() {
  const documents = getParticipatingSiteDocuments();

  return {
    total: documents.length,
    approved: documents.filter(doc => doc.status === "Approved").length,
    pending: documents.filter(doc => doc.status === "Pending").length,
    rejected: documents.filter(doc => doc.status === "Rejected").length,
    expired: documents.filter(doc => doc.status === "Expired").length,
  };
}