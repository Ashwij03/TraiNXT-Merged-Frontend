/**
 * Generic document search.
 */
export const searchDocuments = (
  documents = [],
  keyword = "",
  searchableFields = [
    "name",
    "status",
    "category",
    "documentType",
    "description",
    "createdBy",
    "version",
  ]
) => {
  const query = keyword.trim().toLowerCase();

  if (!query) {
    return documents;
  }

  return documents.filter((document) =>
    searchableFields.some((field) => {
      const value = document[field];

      if (value === null || value === undefined) {
        return false;
      }

      return value.toString().toLowerCase().includes(query);
    })
  );
};

/**
 * Generic document filter.
 */
export const filterDocuments = (
  documents = [],
  filters = {}
) => {
  if (!Object.keys(filters).length) {
    return documents;
  }

  return documents.filter((document) =>
    Object.entries(filters).every(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return true;
      }

      return document[key] === value;
    })
  );
};

/**
 * Generic document sort.
 */
export const sortDocuments = (
  documents = [],
  field = "name",
  direction = "asc"
) => {
  return [...documents].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];

    if (valueA == null) return 1;
    if (valueB == null) return -1;

    if (
      typeof valueA === "string" &&
      typeof valueB === "string"
    ) {
      return direction === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return direction === "asc"
      ? valueA - valueB
      : valueB - valueA;
  });
};

/**
 * Search + Filter + Sort.
 */
export const processDocuments = (
  documents = [],
  {
    keyword = "",
    filters = {},
    searchableFields,
    sortField = "name",
    sortDirection = "asc",
  } = {}
) => {
  let result = searchDocuments(
    documents,
    keyword,
    searchableFields
  );

  result = filterDocuments(result, filters);

  result = sortDocuments(
    result,
    sortField,
    sortDirection
  );

  return result;
};

/**
 * Returns unique values for a field.
 */
export const getUniqueFieldValues = (
  documents = [],
  field
) => {
  return [...new Set(documents.map((doc) => doc[field]))]
    .filter(Boolean)
    .sort();
};

/**
 * Groups documents by any field.
 */
export const groupDocumentsByField = (
  documents = [],
  field
) => {
  return documents.reduce((groups, document) => {
    const key = document[field] || "Unknown";

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(document);

    return groups;
  }, {});
};

/**
 * Returns total matching documents.
 */
export const getSearchResultCount = (
  documents = [],
  keyword = "",
  searchableFields
) => {
  return searchDocuments(
    documents,
    keyword,
    searchableFields
  ).length;
};