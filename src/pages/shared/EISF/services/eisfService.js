import participatingSiteDocuments from "../mock/participatingSiteDocuments";

/**
 * Returns all participating site documents.
 */
export function getParticipatingSiteDocuments() {
  return participatingSiteDocuments;
}

/**
 * Generic alias.
 */
export function getAllDocuments() {
  return getParticipatingSiteDocuments();
}

/**
 * Returns document by id.
 */
export function getDocumentById(documentId) {
  return getParticipatingSiteDocuments().find(
    (document) => document.id === documentId
  );
}

/**
 * Returns documents by section.
 */
export function getDocumentsBySection(sectionId) {
  return getParticipatingSiteDocuments().filter(
    (document) => document.sectionId === sectionId
  );
}

/**
 * Returns documents by folder.
 */
export function getDocumentsByFolder(folderId) {
  return getParticipatingSiteDocuments().filter(
    (document) => document.folderId === folderId
  );
}

/**
 * Returns documents by status.
 */
export function getDocumentsByStatus(status) {
  return getParticipatingSiteDocuments().filter(
    (document) => document.status === status
  );
}

/**
 * Returns documents by document type.
 */
export function getDocumentsByType(documentType) {
  return getParticipatingSiteDocuments().filter(
    (document) => document.documentType === documentType
  );
}

/**
 * Generic search.
 */
export function searchDocuments(searchText = "") {
  const keyword = searchText.trim().toLowerCase();

  if (!keyword) {
    return getParticipatingSiteDocuments();
  }

  return getParticipatingSiteDocuments().filter((document) =>
    [
      document.name,
      document.description,
      document.documentType,
      document.status,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword))
  );
}

/**
 * Returns total document count.
 */
export function getDocumentCount() {
  return getParticipatingSiteDocuments().length;
}

/**
 * Generic reusable filter.
 */
export function filterDocuments(filters = {}) {
  const {
    sectionId,
    folderId,
    status,
    documentType,
  } = filters;

  return getParticipatingSiteDocuments().filter((document) => {
    if (sectionId && document.sectionId !== sectionId) return false;
    if (folderId && document.folderId !== folderId) return false;
    if (status && document.status !== status) return false;
    if (documentType && document.documentType !== documentType) return false;

    return true;
  });
}