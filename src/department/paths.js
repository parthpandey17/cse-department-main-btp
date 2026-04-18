export const SUPPORTED_DEPARTMENTS = ["cse", "ece", "cce", "me"];

export function normalizeDeptKey(value) {
  return String(value || "").trim().toLowerCase();
}

export function isSupportedDept(value) {
  return SUPPORTED_DEPARTMENTS.includes(normalizeDeptKey(value));
}

export function getDepartmentBasePath(dept) {
  return `/department/${normalizeDeptKey(dept)}`;
}

export function buildDepartmentPath(dept, path = "") {
  const base = getDepartmentBasePath(dept);
  if (!path || path === "/") return base;

  if (path.startsWith("?") || path.startsWith("#")) {
    return `${base}${path}`;
  }

  return `${base}/${path.replace(/^\/+/, "")}`;
}
